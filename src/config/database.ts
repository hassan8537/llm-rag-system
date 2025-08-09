import path from "path";

interface DatabaseConfig {
  development: any;
  production: any;
}

const config: DatabaseConfig = {
  development: {
    username: process.env.DB_USER || process.env.username || 'postgres',
    password: process.env.DB_PASSWORD || process.env.password || '1234',
    database: process.env.DB_NAME || process.env.dbname || 'atlas-ai-local',
    host: process.env.DB_HOST || process.env.host || 'localhost',
    port: parseInt(process.env.DB_PORT || process.env.port || '5432'),
    dialect: 'postgres',
    logging: console.log,
    models: [path.join(__dirname, '../models/**/*.model.ts')],
    modelMatch: (filename: string, member: string) => {
      return filename.substring(0, filename.indexOf('.model')) === member.toLowerCase();
    },
  },
  production: {
    username: process.env.DB_USER || process.env.username,
    password: process.env.DB_PASSWORD || process.env.password,
    database: process.env.DB_NAME || process.env.dbname,
    host: process.env.DB_HOST || process.env.host,
    port: parseInt(process.env.DB_PORT || process.env.port || '5432'),
    dialect: 'postgres',
    logging: false,
    ssl: true,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    models: [path.join(__dirname, '../models/**/*.model.js')],
  }
};

export default config;
