export type JwtPayload = {
  id: string;
  login: string;
};

export type JwtPayloadWithRt = JwtPayload & { refreshToken: string };

export type Tokens = {
  accessToken: string;
  refreshToken: string;
  accessExpire: number;
  refreshExpire: number;
};
