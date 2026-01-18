import {
  applyDecorators,
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth } from '@nestjs/swagger';
import { AtGuard, RtGuard } from './guards';
import { JwtPayloadWithRt } from './types';
import { tokensKeys } from './constants';

export const Public = () => SetMetadata('isPublic', true);

export const Private = () =>
  applyDecorators(ApiCookieAuth(tokensKeys.at), UseGuards(AtGuard));

export const PrivateWithRefreshToken = () =>
  applyDecorators(ApiCookieAuth(tokensKeys.rt), UseGuards(RtGuard));

export const GetCurrentUser = createParamDecorator(
  (data: keyof JwtPayloadWithRt | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    if (!data) return request.user;
    return request.user[data];
  },
);
