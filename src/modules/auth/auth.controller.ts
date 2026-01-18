import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  GetCurrentUser,
  JwtPayloadWithRt,
  Private,
  PrivateWithRefreshToken,
  Public,
} from '@shared/common';
import { AuthApi } from '../../dto/auth';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('/signin')
  @HttpCode(HttpStatus.OK)
  async signIn(
    @Res({ passthrough: true }) response: Response,
    @Body() dto: AuthApi.Signin.SigninReqDto,
  ): Promise<AuthApi.Signin.SigninResDto> {
    return this.authService.signIn(response, dto);
  }

  @ApiCreatedResponse({ type: AuthApi.Signup.SignupResDto })
  @Public()
  @Post('/signup')
  @HttpCode(HttpStatus.CREATED)
  signUp(
    @Body() dto: AuthApi.Signup.SignupReqDto,
  ): Promise<AuthApi.Signup.SignupResDto> {
    return this.authService.signUp(dto);
  }

  @Private()
  @Post('/logout')
  @HttpCode(HttpStatus.OK)
  logout(
    @Res({ passthrough: true }) response: Response,
    @GetCurrentUser('id') userId: string,
  ) {
    return this.authService.logout(response, userId);
  }

  @Post('/refresh-access-token')
  @PrivateWithRefreshToken()
  @HttpCode(HttpStatus.OK)
  refreshAccessToken(
    @Res({ passthrough: true }) response: Response,
    @GetCurrentUser() user: JwtPayloadWithRt,
  ) {
    return this.authService.refreshAccessToken(
      user.id,
      user.refreshToken,
      response,
    );
  }
}
