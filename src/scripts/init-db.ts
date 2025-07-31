import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { sequelize } from '../database/connection';

// Load environment variables
dotenv.config();

async function initializeDatabase() {
  try {
    console.log('🔄 Initializing database...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established.');
    
    // Force sync (this will drop and recreate tables)
    await sequelize.sync({ force: true });
    console.log('✅ Database tables created successfully.');
    
    console.log('🎉 Database initialization completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  initializeDatabase();
}
