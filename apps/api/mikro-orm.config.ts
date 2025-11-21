import { Options } from '@mikro-orm/core';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import * as dotenv from 'dotenv';

dotenv.config();

const config: Options = {
  driver: PostgreSqlDriver,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  dbName: process.env.DB_NAME || 'ecommerce_minimart',
  entities: ['dist/**/*.entity.js'],
  entitiesTs: ['src/**/*.entity.ts'],
  debug: process.env.NODE_ENV === 'development',
  metadataProvider: TsMorphMetadataProvider,
  migrations: {
    path: 'dist/database/migrations',
    pathTs: 'src/database/migrations',
    glob: '!(*.d).{js,ts}',
    transactional: true,
    disableForeignKeys: false,
  },
  seeder: {
    path: 'dist/database/seeders',
    pathTs: 'src/database/seeders',
  },
};

export default config;

