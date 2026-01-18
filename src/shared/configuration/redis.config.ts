import * as dotenv from 'dotenv';
dotenv.config();

const { REDIS_HOST, REDIS_PASSWORD, REDIS_PORT } = process.env;
export const configRedis = {
  port: REDIS_PORT,
  password: REDIS_PASSWORD,
  host: REDIS_HOST,
};
