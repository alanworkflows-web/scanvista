#!/bin/bash
# ScanVista Database Restore Script

if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL is not set."
  exit 1
fi

if [ -z "$1" ]; then
  echo "Usage: ./restore.sh <backup_file.dump>"
  exit 1
fi

BACKUP_FILE=$1

if [ ! -f "$BACKUP_FILE" ]; then
  echo "Error: Backup file $BACKUP_FILE not found."
  exit 1
fi

echo "WARNING: This will DESTROY ALL EXISTING DATA in $DATABASE_URL and replace it with $BACKUP_FILE."
read -p "Are you sure you want to continue? (y/n): " confirm

if [[ $confirm == [yY] || $confirm == [yY][eE][sS] ]]; then
  echo "Starting restore..."
  pg_restore --clean --if-exists --dbname="$DATABASE_URL" "$BACKUP_FILE"
  
  if [ $? -eq 0 ]; then
    echo "Restore completed successfully."
  else
    echo "Restore failed!"
    exit 1
  fi
else
  echo "Restore aborted."
fi
