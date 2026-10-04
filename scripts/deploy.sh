#!/bin/bash

###############################################################################
# Deployment Script
# Deploys or updates the application
###############################################################################

set -e

PROJECT_DIR="$HOME/ProjekAbsensi"
BACKUP_DIR="$HOME/backups"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

echo "🚀 Starting Deployment..."

# Check if deployment is already in progress
if [ -f /tmp/deploy.lock ]; then
    echo "❌ Deployment already in progress"
    exit 1
fi

# Create deployment lock
touch /tmp/deploy.lock
trap "rm -f /tmp/deploy.lock" EXIT

cd $PROJECT_DIR

# Pre-deployment backup
echo "💾 Creating pre-deployment backup..."
./scripts/backup.sh pre-deploy-$TIMESTAMP

# Pull latest code
echo "📥 Pulling latest code from repository..."
git pull origin main

# Build frontend
echo "🏗️ Building frontend..."
cd frontend
npm install
npm run build
cd ..

# Copy environment files if not exist
if [ ! -f backend/.env ]; then
    echo "⚙️ Creating backend .env file..."
    cp backend/.env.production.example backend/.env
    echo "⚠️  Please edit backend/.env with your configuration"
fi

if [ ! -f face-service/.env ]; then
    echo "⚙️ Creating face-service .env file..."
    cp face-service/.env.production.example face-service/.env
fi

# Build and start Docker containers
echo "🐳 Building and starting Docker containers..."
docker-compose up -d --build

# Wait for MySQL to be ready
echo "⏳ Waiting for MySQL to be ready..."
sleep 10

# Run Laravel migrations
echo "📊 Running database migrations..."
docker exec absensi-backend php artisan migrate --force

# Clear Laravel cache
echo "🧹 Clearing Laravel cache..."
docker exec absensi-backend php artisan config:clear
docker exec absensi-backend php artisan cache:clear
docker exec absensi-backend php artisan route:clear
docker exec absensi-backend php artisan view:clear

# Optimize Laravel
echo "⚡ Optimizing Laravel..."
docker exec absensi-backend php artisan config:cache
docker exec absensi-backend php artisan route:cache
docker exec absensi-backend php artisan view:cache

# Health checks
echo "🏥 Running health checks..."
sleep 5

# Check backend
if ! curl -f http://localhost:8000/api/health &> /dev/null; then
    echo "❌ Backend health check failed"
    echo "🔄 Rolling back..."
    git reset --hard HEAD~1
    docker-compose up -d --build
    exit 1
fi

# Check face service
if ! curl -f http://localhost:8001/health &> /dev/null; then
    echo "❌ Face service health check failed"
    echo "🔄 Rolling back..."
    git reset --hard HEAD~1
    docker-compose up -d --build
    exit 1
fi

# Check frontend
if ! curl -f http://localhost:3000 &> /dev/null; then
    echo "❌ Frontend health check failed"
    echo "🔄 Rolling back..."
    git reset --hard HEAD~1
    docker-compose up -d --build
    exit 1
fi

echo ""
echo "✅ Deployment completed successfully!"
echo ""
echo "Services running:"
docker-compose ps
echo ""
echo "Application URLs:"
echo "- Frontend: http://localhost:3000"
echo "- Backend API: http://localhost:8000"
echo "- Face Service: http://localhost:8001"
