export interface IConfigJwt {
  atSecret: string;
  rtSecret: string;
  rtTtlSeconds: number;
  atTtlSeconds: number;
  atExp: string;
  rtExp: string;
}
