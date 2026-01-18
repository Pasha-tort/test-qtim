import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthApi } from '../../dto/auth';
import * as bcrypt from 'bcrypt';
import { UserEntity } from '../../entities';
import { Response } from 'express';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { TokensService } from '../tokens/tokens.service';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly tokensService: TokensService,
    private readonly userService: UserService,
  ) {}

  async signIn(
    response: Response,
    { login, password }: AuthApi.Signin.SigninReqDto,
  ): Promise<AuthApi.Signin.SigninResDto> {
    const user = await this.userService.findByLogin(login);

    if (!user) {
      throw new UnauthorizedException('Login or password is incorrect');
    }

    const isPasswordMatched = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordMatched) {
      throw new UnauthorizedException('Login or password is incorrect');
    }

    const tokens = await this.tokensService.getTokens(user);
    await this.tokensService.setTokenHash(
      user.id,
      tokens.refreshToken,
      tokens.refreshExpire,
    );

    this.tokensService.createCookies(response, tokens);

    return {
      username: user.username,
      id: user.id,
    };
  }

  async signUp({
    login,
    username,
    password,
    confirmPassword,
  }: AuthApi.Signup.SignupReqDto) {
    if (password !== confirmPassword)
      throw new ConflictException('Passwords do not match');

    await this.dataSource.transaction(async em => {
      const exist = await em.existsBy(UserEntity, [{ login }, { username }]);
      if (exist)
        throw new ConflictException('A user with this login already exists.');

      const salt = await bcrypt.genSalt();
      const passwordHash = await bcrypt.hash(password, salt);
      await em
        .insert(UserEntity, { passwordHash, login, username })
        .catch(e => {
          if (e.code === '23505')
            throw new ConflictException(
              'A user with this login already exists.',
            );
          throw e;
        });
    });

    return { message: 'You have successfully completed registration' };
  }

  async logout(response: Response, userId: string) {
    await this.tokensService.clearCookie(response);
    await this.tokensService.resetRefreshToken(userId);
  }

  async refreshAccessToken(id: string, token: string, response: Response) {
    const user = await this.userService.findById(id);
    if (!user) throw new UnauthorizedException('Invalid token');
    const rt = await this.tokensService.findOneByUserId(id);
    if (!rt || !rt.tokenHash) throw new UnauthorizedException('Invalid token');
    const isTokenMatched = await bcrypt.compare(token, rt.tokenHash);
    if (!isTokenMatched) throw new UnauthorizedException('Invalid token');

    const tokens = await this.tokensService.getTokens(user);
    await this.tokensService.setTokenHash(
      user.id,
      tokens.refreshToken,
      tokens.refreshExpire,
    );
    return this.tokensService.createCookies(response, tokens);
  }
}
