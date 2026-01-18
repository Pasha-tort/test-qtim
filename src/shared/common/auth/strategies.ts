import { ForbiddenException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { JwtPayload, JwtPayloadWithRt } from './types';
import { configJwt } from '@shared/configuration';
import { Request } from 'express';
import { tokensKeys } from './constants';

@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: (req: Request) => {
        return req?.cookies?.[tokensKeys.at];
      },
      secretOrKey: configJwt.atSecret,
      passReqToCallback: true,
    });
  }

  validate(_: Request, payload: JwtPayload) {
    return payload;
  }
}

@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor() {
    super({
      jwtFromRequest: (req: Request) => {
        return req?.cookies?.[tokensKeys.rt];
      },
      secretOrKey: configJwt.rtSecret,
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: JwtPayload): JwtPayloadWithRt {
    const refreshToken = req?.cookies?.[tokensKeys.rt];

    if (!refreshToken) throw new ForbiddenException('Refresh token malformed');

    return {
      ...payload,
      refreshToken,
    };
  }
}
