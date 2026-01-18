import 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from './strategy';
import { IConfigDatabase } from '@shared/configuration';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

export function getDataSourceOptions(
  databaseConfig: IConfigDatabase,
  extra: Omit<Partial<PostgresConnectionOptions>, 'type' | 'driver'> = {},
  pathsMigrations: string[],
) {
  const dataSourceOptions: DataSourceOptions = {
    ...databaseConfig,
    logging: false,
    // synchronize: true,
    synchronize: false,
    // migrations: [join(__dirname, './migrations/*.{js,ts}')],
    migrations: pathsMigrations,
    namingStrategy: new SnakeNamingStrategy(),
    migrationsRun: true,
    ...extra,
  };
  return {
    dataSourceOptions,
    dataSource: new DataSource(dataSourceOptions),
  };
}
