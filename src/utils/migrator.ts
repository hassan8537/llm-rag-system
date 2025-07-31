import { Umzug, SequelizeStorage } from 'umzug';
import * as path from 'path';

/**
 * Create migrator instance with sequelize connection
 */
const createMigrator = (sequelize: any) => {
  return new Umzug({
    migrations: {
      glob: './migrations/*.js',
      resolve: ({ name, path, context }) => {
        const migration = require(path!);
        return {
          name,
          up: async () => migration.up(context.queryInterface, context.Sequelize),
          down: async () => migration.down(context.queryInterface, context.Sequelize),
        };
      },
    },
    context: {
      queryInterface: sequelize.getQueryInterface(),
      Sequelize: sequelize.constructor,
    },
    storage: new SequelizeStorage({
      sequelize,
      tableName: 'SequelizeMeta',
    }),
    logger: console,
  });
};

/**
 * Run all pending migrations
 */
export const runMigrations = async (sequelize: any): Promise<void> => {
  try {
    console.log('🔄 Checking for pending migrations...');
    
    const migrator = createMigrator(sequelize);
    const pendingMigrations = await migrator.pending();
    
    if (pendingMigrations.length === 0) {
      console.log('✅ No pending migrations found.');
      return;
    }
    
    console.log(`📋 Found ${pendingMigrations.length} pending migration(s):`);
    pendingMigrations.forEach(migration => {
      console.log(`  - ${migration.name}`);
    });
    
    console.log('🚀 Running migrations...');
    await migrator.up();
    
    console.log('✅ All migrations completed successfully.');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

/**
 * Rollback the last migration
 */
export const rollbackMigration = async (sequelize: any): Promise<void> => {
  try {
    console.log('🔄 Rolling back last migration...');
    const migrator = createMigrator(sequelize);
    await migrator.down();
    console.log('✅ Migration rollback completed.');
  } catch (error) {
    console.error('❌ Migration rollback failed:', error);
    throw error;
  }
};

/**
 * Get migration status
 */
export const getMigrationStatus = async (sequelize: any): Promise<{
  executed: string[];
  pending: string[];
}> => {
  const migrator = createMigrator(sequelize);
  const executed = await migrator.executed();
  const pending = await migrator.pending();
  
  return {
    executed: executed.map(m => m.name),
    pending: pending.map(m => m.name),
  };
};
