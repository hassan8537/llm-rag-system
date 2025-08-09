interface DatabaseConfig {
  development: any;
  production: any;
}

const config: DatabaseConfig = {
  development: {
    username: "postgres",
    password: "12345",
    database: "atlas-ai-local",
    host: "localhost",
    port: 5432,
    dialect: "postgres",
    logging: console.log,
  },
  production: {
    username: process.env.DB_USER || process.env.username,
    password: process.env.DB_PASSWORD || process.env.password,
    database: process.env.DB_NAME || process.env.dbname,
    host: process.env.DB_HOST || process.env.host,
    port: 5432,
    dialect: "postgres",
    logging: false,
    ssl: true,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
};

export default config;
