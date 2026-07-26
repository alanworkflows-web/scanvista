#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const backupFile = process.argv[2];
const dbUrl = process.env.DATABASE_URL;

if (!backupFile) {
  console.error('Error: Please provide the path to the backup file.');
  console.error('Usage: node scripts/db-restore.cjs <path-to-backup.dump>');
  process.exit(1);
}

if (!fs.existsSync(backupFile)) {
  console.error(`Error: Backup file not found at ${backupFile}`);
  process.exit(1);
}

if (!dbUrl) {
  console.error('Error: DATABASE_URL environment variable is required.');
  process.exit(1);
}

console.log('⚠️  WARNING: This will overwrite the target database.');
console.log(`Restoring ${backupFile}...`);

try {
  // Use pg_restore. --clean drops DB objects before recreating them. --no-owner skips ownership restoration (crucial for Neon/RDS).
  execSync(`pg_restore --clean --no-owner --no-acl --dbname="${dbUrl}" "${backupFile}"`, { stdio: 'inherit' });
  console.log('✅ Restore completed successfully.');
} catch (error) {
  console.error('❌ Restore failed:', error.message);
  process.exit(1);
}
