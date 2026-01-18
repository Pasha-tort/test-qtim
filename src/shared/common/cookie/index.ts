import { Response } from 'express';

type DataCookie = {
  key: string;
  hash: string;
  path?: string;
  httpOnly?: boolean;
  sameSite?: boolean | 'strict' | 'lax' | 'none';
  options?:
    | {
        expire?: number | Date;
        ttlSeconds?: undefined;
      }
    | { ttlSeconds?: number; expire?: undefined };
};

/**
 * Функция мутирует значение res
 * @param ttl значение задается в ms
 * @param expire значение задается в ms
 */
export function createCookies(res: Response, dataCookies: DataCookie[]) {
  dataCookies.forEach(cookie => {
    const { key, hash, path, options, sameSite, httpOnly = true } = cookie;
    res.cookie(key, hash, {
      expires: options?.expire
        ? new Date(options.expire)
        : options?.ttlSeconds
          ? new Date(new Date().getTime() + options.ttlSeconds * 1000)
          : undefined,
      sameSite: sameSite || 'strict',
      secure: false,
      httpOnly,
      path,
    });
  });
}
