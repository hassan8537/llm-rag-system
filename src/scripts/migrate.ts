#!/usr/bin/env node

import { Command } from 'commander';
import { runMigrations, rollbackMigration, getMigrationStatus } from '../utils/migrator';

const program = new Command();

program
  .name('migrate')
  .description('Database migration CLI')
  .version('1.0.0');

program
  .command('up')
  .description('Run all pending migrations')
  .action(async () => {
    try {
      const { sequelize } = await import('../database/connection');
      await runMigrations(sequelize);
      await sequelize.close();
      process.exit(0);
    } catch (error) {
      console.error('Migration failed:', error);
      process.exit(1);
    }
  });

program
  .command('down')
  .description('Rollback the last migration')
  .action(async () => {
    try {
      const { sequelize } = await import('../database/connection');
      await rollbackMigration(sequelize);
      await sequelize.close();
      process.exit(0);
    } catch (error) {
      console.error('Migration rollback failed:', error);
      process.exit(1);
    }
  });

program
  .command('status')
  .description('Check migration status')
  .action(async () => {
    try {
      const { sequelize } = await import('../database/connection');
      const status = await getMigrationStatus(sequelize);
      
      console.log('\n📊 Migration Status:');
      console.log(`✅ Executed migrations (${status.executed.length}):`);
      status.executed.forEach(name => console.log(`  - ${name}`));
      
      console.log(`\n⏳ Pending migrations (${status.pending.length}):`);
      status.pending.forEach(name => console.log(`  - ${name}`));
      
      await sequelize.close();
      process.exit(0);
    } catch (error) {
      console.error('Failed to get migration status:', error);
      process.exit(1);
    }
  });

program.parse();
