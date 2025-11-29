#!/bin/bash

# Script để rebuild admin service
# Usage: ./scripts/rebuild-admin.sh

set -e

echo "🛑 Stopping admin container..."
docker-compose -f docker-compose.prod.yml stop admin || true

echo "🗑️  Removing admin container..."
docker-compose -f docker-compose.prod.yml rm -f admin || true

echo "🧹 Cleaning up old admin images..."
docker images | grep -E "ecommerce.*admin|.*admin.*latest" | awk '{print $3}' | xargs -r docker rmi -f 2>/dev/null || true

echo "🔨 Rebuilding admin service..."
docker-compose -f docker-compose.prod.yml build --no-cache admin

echo "🚀 Starting admin service..."
docker-compose -f docker-compose.prod.yml up -d admin

echo "✅ Admin service rebuilt successfully!"
echo ""
echo "📊 Checking status..."
docker-compose -f docker-compose.prod.yml ps admin

