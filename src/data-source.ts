import { getDataSourceOptions } from './database';
import { UserEntity, RefreshTokenEntity, ArticleEntity } from './entities';
import { join } from 'path';
import * as dotenv from 'dotenv';
dotenv.config();

const {
  DB_HOST,
  POSTGRES_PORT,
  POSTGRES_DB,
  POSTGRES_USER,
  POSTGRES_PASSWORD,
} = process.env;

const configDatabase = {
  type: 'postgres' as const,
  host: DB_HOST,
  port: Number(POSTGRES_PORT),
  username: POSTGRES_USER,
  password: POSTGRES_PASSWORD,
  database: POSTGRES_DB,
};

const dataSourceObj = getDataSourceOptions(
  configDatabase,
  {
    entities: [UserEntity, RefreshTokenEntity, ArticleEntity],
  },
  [join(__dirname, './migrations/*.{js,ts}')],
);

export const { dataSourceOptions } = dataSourceObj;

export default dataSourceObj.dataSource;
