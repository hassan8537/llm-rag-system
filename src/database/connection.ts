import { Sequelize } from 'sequelize-typescript';
import config from '../config/database';
import { User } from '../models/user.model';
import { Chat } from '../models/chat.model';
import { ChatMessage } from '../models/chat-message.model';
import { Document } from '../models/document.model';
import { Embedding } from '../models/embedding.model';

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env as keyof typeof config];

export const sequelize = new Sequelize({
  database: dbConfig.database,
  username: dbConfig.username,
  password: dbConfig.password,
  host: dbConfig.host,
  port: dbConfig.port,
  dialect: 'postgres',
  logging: dbConfig.logging,
  models: [User, Chat, ChatMessage, Document, Embedding],
  ...(dbConfig.dialectOptions && { dialectOptions: dbConfig.dialectOptions }),
});

export const connectDatabase = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection has been established successfully.');
    
    // Sync models (in development only)
    if (env === 'development') {
      await sequelize.sync({ alter: true });
      console.log('✅ Database models synchronized.');
    }
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    process.exit(1);
  }
};

export default sequelize;
