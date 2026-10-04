#!/bin/bash

###############################################################################
# Health Check Script
# Checks if all services are running properly
###############################################################################

set -e

PROJECT_DIR="$HOME/ProjekAbsensi"

echo "🏥 Running Health Checks..."
echo ""

cd $PROJECT_DIR

# Check Docker containers
echo "📦 Checking Docker containers..."
docker-compose ps

# Check Backend API
echo ""
echo "🔍 Checking Backend API..."
if curl -f http://localhost:8000/api/health &> /dev/null; then
    echo "✅ Backend API: OK"
else
    echo "❌ Backend API: FAILED"
fi

# Check Face Service
echo ""
echo "🔍 Checking Face Recognition Service..."
if curl -f http://localhost:8001/health &> /dev/null; then
    echo "✅ Face Service: OK"
else
    echo "❌ Face Service: FAILED"
fi

# Check Frontend
echo ""
echo "🔍 Checking Frontend..."
if curl -f http://localhost:3000 &> /dev/null; then
    echo "✅ Frontend: OK"
else
    echo "❌ Frontend: FAILED"
fi

# Check MySQL
echo ""
echo "🔍 Checking MySQL Database..."
if docker exec absensi-mysql mysqladmin ping -h localhost &> /dev/null; then
    echo "✅ MySQL: OK"
else
    echo "❌ MySQL: FAILED"
fi

# Check disk space
echo ""
echo "💾 Disk Space:"
df -h / | tail -1 | awk '{print "  Used: " $3 " / " $2 " (" $5 ")"}'

# Check memory
echo ""
echo "🧠 Memory Usage:"
free -h | grep Mem | awk '{print "  Used: " $3 " / " $2}'

# Check Docker logs for errors
echo ""
echo "📋 Recent errors in logs:"
docker-compose logs --tail=50 | grep -i error || echo "  No recent errors found"

echo ""
echo "✅ Health check completed"
