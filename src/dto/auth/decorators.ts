import { settingsUser } from '@shared/common';
import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export function ApplyPasswordDecorators({
  messageNotMatches,
  validationPassword = true,
}: { messageNotMatches?: string; validationPassword?: boolean } = {}) {
  const validationMessage =
    'Your password must be at least 8 characters. Password must contain numbers, upper-case letters, lower-case letters, and special characters.';
  return applyDecorators(
    ...[
      ApiProperty({
        description: 'User password',
        default: 'PaSSword12{}',
        minLength: 8,
      }),
      Expose(),
      IsString(),
      IsNotEmpty(),
      MinLength(8, {
        message: validationMessage,
      }),
      MaxLength(128, {
        message: 'Maximum password length: 128 characters',
      }),
      validationPassword
        ? Matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+~{}:"<>?[\];',./])[A-Za-z\d!@#$%^&*()_+~{}:"<>?[\];',./]{8,}$/,
            {
              message: messageNotMatches || validationMessage,
            },
          )
        : null,
    ].filter(Boolean),
  );
}

export function ApplyLoginDecorators() {
  return applyDecorators(
    Expose(),
    IsString(),
    IsNotEmpty(),
    MaxLength(settingsUser.maxLengthCharsLogin),
    MinLength(settingsUser.minLengthCharsLogin),
    ApiProperty({
      description: 'User login',
      maxLength: settingsUser.maxLengthCharsLogin,
      minLength: settingsUser.minLengthCharsLogin,
      example: 'pasha_tort',
    }),
  );
}
