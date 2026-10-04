#!/bin/bash

###############################################################################
# Backup Script
# Creates backup of database and storage files
###############################################################################

set -e

BACKUP_DIR="$HOME/backups"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_NAME=${1:-backup-$TIMESTAMP}
PROJECT_DIR="$HOME/ProjekAbsensi"

echo "💾 Creating backup: $BACKUP_NAME"

# Create backup directory
mkdir -p $BACKUP_DIR

cd $PROJECT_DIR

# Backup database
echo "📊 Backing up database..."
docker exec absensi-mysql mysqldump -u root -p${DB_ROOT_PASSWORD:-root_password_change_me} ${DB_DATABASE:-projek_absensi} | gzip > $BACKUP_DIR/$BACKUP_NAME-database.sql.gz

# Backup Laravel storage
echo "📁 Backing up Laravel storage..."
tar -czf $BACKUP_DIR/$BACKUP_NAME-storage.tar.gz -C backend/storage app

# Backup environment files
echo "⚙️ Backing up environment files..."
tar -czf $BACKUP_DIR/$BACKUP_NAME-env.tar.gz backend/.env face-service/.env

# Create backup manifest
cat > $BACKUP_DIR/$BACKUP_NAME-manifest.txt << EOF
Backup Date: $(date)
Git Commit: $(git rev-parse HEAD)
Git Branch: $(git rev-parse --abbrev-ref HEAD)
Database: $BACKUP_DIR/$BACKUP_NAME-database.sql.gz
Storage: $BACKUP_DIR/$BACKUP_NAME-storage.tar.gz
Environment: $BACKUP_DIR/$BACKUP_NAME-env.tar.gz
EOF

echo "✅ Backup completed: $BACKUP_NAME"
echo "📍 Location: $BACKUP_DIR"

# Cleanup old backups (keep last 7 days)
echo "🧹 Cleaning up old backups..."
find $BACKUP_DIR -name "backup-*" -type f -mtime +7 -delete
find $BACKUP_DIR -name "pre-deploy-*" -type f -mtime +3 -delete

echo "✅ Backup process completed"
