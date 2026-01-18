import { ApplyPasswordDecorators, ApplyLoginDecorators } from './decorators';
import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';
import { settingsUser } from '@shared/common';

export namespace AuthApi {
  export namespace Signup {
    @Exclude()
    export class SignupReqDto {
      @ApiProperty()
      @Expose()
      @IsString()
      @MaxLength(settingsUser.maxLengthCharsUsername)
      @MinLength(settingsUser.minLengthCharsUsername)
      username: string;

      @ApplyLoginDecorators()
      login: string;

      @ApplyPasswordDecorators()
      password: string;

      @ApplyPasswordDecorators()
      confirmPassword: string;
    }

    export class SignupResDto {
      @ApiProperty()
      message: string;
    }
  }

  export namespace Signin {
    export class SigninReqDto {
      @ApplyLoginDecorators()
      login: string;
      @ApplyPasswordDecorators()
      password: string;
    }
    export class SigninResDto {
      @ApiProperty()
      username: string;

      @ApiProperty()
      id: string;
    }
  }
}
