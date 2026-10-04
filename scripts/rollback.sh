#!/bin/bash

###############################################################################
# Rollback Script
# Rollback to previous version
###############################################################################

set -e

PROJECT_DIR="$HOME/ProjekAbsensi"

echo "🔄 Rolling back to previous version..."

cd $PROJECT_DIR

# Get current commit
CURRENT_COMMIT=$(git rev-parse HEAD)
echo "Current commit: $CURRENT_COMMIT"

# Get previous commit
PREVIOUS_COMMIT=$(git rev-parse HEAD~1)
echo "Rolling back to: $PREVIOUS_COMMIT"

# Confirm rollback
read -p "Are you sure you want to rollback? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
    echo "❌ Rollback cancelled"
    exit 1
fi

# Create backup before rollback
echo "💾 Creating backup before rollback..."
./scripts/backup.sh rollback-from-$(git rev-parse --short HEAD)

# Rollback code
echo "🔄 Rolling back code..."
git reset --hard HEAD~1

# Rebuild containers
echo "🐳 Rebuilding containers..."
docker-compose up -d --build

# Wait for services
sleep 10

# Run migrations rollback if needed
echo "📊 Rolling back migrations..."
docker exec absensi-backend php artisan migrate:rollback --step=1

# Clear cache
docker exec absensi-backend php artisan cache:clear
docker exec absensi-backend php artisan config:clear

echo ""
echo "✅ Rollback completed"
echo ""
echo "Run health-check.sh to verify system status"
