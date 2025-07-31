import * as path from 'path';

interface DatabaseConfig {
  development: any;
  production: any;
}

const config: DatabaseConfig = {
  development: {
    username: process.env.username || 'postgres',
    password: process.env.password || '1234',
    database: process.env.dbname || 'atlas-ai-local',
    host: process.env.host || 'localhost',
    port: parseInt(process.env.port || '5432'),
    dialect: 'postgres',
    logging: console.log,
    models: [path.join(__dirname, '../models/**/*.model.ts')],
    modelMatch: (filename: string, member: string) => {
      return filename.substring(0, filename.indexOf('.model')) === member.toLowerCase();
    },
  },
  production: {
    username: process.env.username,
    password: process.env.password,
    database: process.env.dbname,
    host: process.env.host,
    port: parseInt(process.env.port || '5432'),
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
