#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Ensure backups directory exists
const backupDir = path.join(process.cwd(), 'backups');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// Generate filename with timestamp
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupFile = path.join(backupDir, `backup-${timestamp}.dump`);

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error('Error: DATABASE_URL environment variable is required.');
  process.exit(1);
}

console.log(`Starting database backup to ${backupFile}...`);

try {
  // Use pg_dump in custom format (-Fc)
  execSync(`pg_dump --format=c --file="${backupFile}" "${dbUrl}"`, { stdio: 'inherit' });
  console.log('✅ Backup completed successfully.');
} catch (error) {
  console.error('❌ Backup failed:', error.message);
  process.exit(1);
}
