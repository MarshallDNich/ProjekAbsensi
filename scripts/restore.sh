#!/bin/bash

###############################################################################
# Restore Script
# Restores database and storage from backup
###############################################################################

set -e

if [ -z "$1" ]; then
    echo "Usage: ./restore.sh <backup-name>"
    echo ""
    echo "Available backups:"
    ls -lh ~/backups/ | grep -E '\.sql\.gz|\.tar\.gz'
    exit 1
fi

BACKUP_NAME=$1
BACKUP_DIR="$HOME/backups"
PROJECT_DIR="$HOME/ProjekAbsensi"

echo "🔄 Restoring from backup: $BACKUP_NAME"

cd $PROJECT_DIR

# Restore database
if [ -f "$BACKUP_DIR/$BACKUP_NAME-database.sql.gz" ]; then
    echo "📊 Restoring database..."
    gunzip < $BACKUP_DIR/$BACKUP_NAME-database.sql.gz | docker exec -i absensi-mysql mysql -u root -p${DB_ROOT_PASSWORD:-root_password_change_me} ${DB_DATABASE:-projek_absensi}
    echo "✅ Database restored"
else
    echo "⚠️  Database backup not found: $BACKUP_DIR/$BACKUP_NAME-database.sql.gz"
fi

# Restore Laravel storage
if [ -f "$BACKUP_DIR/$BACKUP_NAME-storage.tar.gz" ]; then
    echo "📁 Restoring Laravel storage..."
    tar -xzf $BACKUP_DIR/$BACKUP_NAME-storage.tar.gz -C backend/storage/
    docker exec absensi-backend chown -R www-data:www-data /var/www/html/storage
    echo "✅ Storage restored"
else
    echo "⚠️  Storage backup not found: $BACKUP_DIR/$BACKUP_NAME-storage.tar.gz"
fi

# Restore environment files
if [ -f "$BACKUP_DIR/$BACKUP_NAME-env.tar.gz" ]; then
    echo "⚙️ Restoring environment files..."
    tar -xzf $BACKUP_DIR/$BACKUP_NAME-env.tar.gz
    echo "✅ Environment files restored"
else
    echo "⚠️  Environment backup not found: $BACKUP_DIR/$BACKUP_NAME-env.tar.gz"
fi

echo ""
echo "✅ Restore completed"
echo ""
echo "Restart containers to apply changes:"
echo "  docker-compose restart"
