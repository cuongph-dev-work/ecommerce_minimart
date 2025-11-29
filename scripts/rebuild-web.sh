#!/bin/bash

# Script để rebuild web service
# Usage: ./scripts/rebuild-web.sh

set -e

echo "🛑 Stopping web container..."
docker-compose -f docker-compose.prod.yml stop web || true

echo "🗑️  Removing web container..."
docker-compose -f docker-compose.prod.yml rm -f web || true

echo "🧹 Cleaning up old web images..."
docker images | grep -E "ecommerce.*web|.*web.*latest" | awk '{print $3}' | xargs -r docker rmi -f 2>/dev/null || true

echo "🔨 Rebuilding web service..."
docker-compose -f docker-compose.prod.yml build --no-cache web

echo "🚀 Starting web service..."
docker-compose -f docker-compose.prod.yml up -d web

echo "✅ Web service rebuilt successfully!"
echo ""
echo "📊 Checking status..."
docker-compose -f docker-compose.prod.yml ps web

