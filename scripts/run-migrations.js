#!/usr/bin/env node
/**
 * Migration Runner Script
 * 
 * Runs database migrations for the Training Scheduling application.
 * This script can be run manually or as part of a deployment process.
 * 
 * Usage:
 *   node scripts/run-migrations.js [--dry-run] [--force]
 * 
 * Options:
 *   --dry-run    Show what would be executed without running
 *   --force      Run migrations even if already applied
 */

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

const MIGRATIONS_DIR = path.join(__dirname, '..', 'migrations');
const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'bzt_main_db',
  multipleStatements: true
};

// Migration files in order
const MIGRATIONS = [
  'db-init-training-scheduler.sql',
  'db-add-training-scheduler-app.sql'
];

async function runMigrations(options = {}) {
  const { dryRun = false, force = false } = options;
  
  console.log('🚀 Training Scheduler Migration Runner');
  console.log('=====================================\n');
  
  // Check database connection
  let connection;
  try {
    console.log('📡 Connecting to database...');
    connection = await mysql.createConnection(DB_CONFIG);
    console.log('✅ Connected to database\n');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
  
  // Check/create migrations tracking table
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS migration_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        app_code VARCHAR(50) NOT NULL,
        migration_file VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_migration (app_code, migration_file)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
  } catch (error) {
    console.error('❌ Failed to create migration tracking table:', error.message);
    await connection.end();
    process.exit(1);
  }
  
  // Run each migration
  for (const migrationFile of MIGRATIONS) {
    const migrationPath = path.join(MIGRATIONS_DIR, migrationFile);
    
    if (!fs.existsSync(migrationPath)) {
      console.warn(`⚠️  Migration file not found: ${migrationFile}`);
      continue;
    }
    
    // Check if already executed
    if (!force) {
      const [rows] = await connection.query(
        'SELECT * FROM migration_history WHERE app_code = ? AND migration_file = ?',
        ['training-scheduler', migrationFile]
      );
      
      if (rows.length > 0) {
        console.log(`⏭️  Skipping ${migrationFile} (already executed)`);
        continue;
      }
    }
    
    console.log(`📄 Running migration: ${migrationFile}`);
    
    if (dryRun) {
      const sql = fs.readFileSync(migrationPath, 'utf8');
      console.log('   SQL Preview (first 200 chars):');
      console.log('   ' + sql.substring(0, 200).replace(/\n/g, '\n   ') + '...\n');
      continue;
    }
    
    try {
      const sql = fs.readFileSync(migrationPath, 'utf8');
      
      // Execute migration
      await connection.query(sql);
      
      // Record in migration history
      await connection.query(
        'INSERT INTO migration_history (app_code, migration_file) VALUES (?, ?) ON DUPLICATE KEY UPDATE executed_at = CURRENT_TIMESTAMP',
        ['training-scheduler', migrationFile]
      );
      
      console.log(`✅ Migration completed: ${migrationFile}\n`);
    } catch (error) {
      console.error(`❌ Migration failed: ${migrationFile}`);
      console.error('   Error:', error.message);
      await connection.end();
      process.exit(1);
    }
  }
  
  await connection.end();
  console.log('✨ All migrations completed successfully!');
}

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  dryRun: args.includes('--dry-run'),
  force: args.includes('--force')
};

// Run migrations
runMigrations(options).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

