#!/bin/bash
# ScanVista Database Backup Script

if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL is not set."
  exit 1
fi

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="scanvista_backup_$TIMESTAMP.dump"

echo "Starting database backup..."
pg_dump --dbname="$DATABASE_URL" -Fc -f "$BACKUP_FILE"

if [ $? -eq 0 ]; then
  echo "Backup successful: $BACKUP_FILE"
else
  echo "Backup failed!"
  exit 1
fi
