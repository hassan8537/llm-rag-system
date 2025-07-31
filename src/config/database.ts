import * as path from 'path';

interface DatabaseConfig {
  development: any;
  production: any;
}

const config: DatabaseConfig = {
  development: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'atlas-ai-local',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    dialect: 'postgres',
    logging: console.log,
    models: [path.join(__dirname, '../models/**/*.model.ts')],
    modelMatch: (filename: string, member: string) => {
      return filename.substring(0, filename.indexOf('.model')) === member.toLowerCase();
    },
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    dialect: 'postgres',
    logging: false,
    ssl: true,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    models: [path.join(__dirname, '../models/**/*.model.ts')],
  }
};

export default config;
