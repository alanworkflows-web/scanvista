# Backup & Restore Runbook

## Overview
This runbook covers how to manually backup and restore the PostgreSQL database using `pg_dump` and `pg_restore`. Our database is hosted on Neon, which provides automated Point-In-Time-Recovery (PITR), but manual backups are required for compliance and off-site cold storage.

## Prerequisite
Ensure you have the `pg_dump` and `pg_restore` binaries installed locally, which are included with the PostgreSQL client tools.
You will need the `DATABASE_URL` for the target environment.

## 1. Taking a Manual Backup
Execute the backup script:
\`\`\`bash
export DATABASE_URL="postgresql://user:pass@host/dbname"
node scripts/db-backup.cjs
\`\`\`
This will create a `.dump` file in the `backups/` directory using the custom PostgreSQL compressed format.

## 2. Restoring a Backup
> [!WARNING]
> Restoring a backup with `--clean` will drop the existing schema and data in the target database. Never run this against the primary production database unless executing a full disaster recovery protocol.

Execute the restore script:
\`\`\`bash
export DATABASE_URL="postgresql://user:pass@target_host/dbname"
node scripts/db-restore.cjs backups/backup-timestamp.dump
\`\`\`

## 3. Neon DB Point-In-Time-Recovery (Alternative)
For accidental data deletion, do not use `pg_restore`. Instead, use Neon's branching feature:
1. Log into the Neon Console.
2. Select the `main` branch.
3. Click "Restore" or "Create Branch".
4. Select the exact timestamp before the data loss occurred.
5. Promote the new branch to be the primary production branch.
