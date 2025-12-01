#!/bin/bash

# Script để rebuild nginx service
# Usage: ./scripts/rebuild-nginx.sh

set -e

echo "🧹 Cleaning Docker cache..."
docker builder prune -f || true
docker container prune -f || true

echo "🛑 Stopping nginx container..."
docker-compose -f docker-compose.prod.yml stop nginx || true

echo "🗑️  Removing nginx container..."
docker-compose -f docker-compose.prod.yml rm -f nginx || true

echo "🧹 Cleaning up old nginx images..."
docker images | grep -E "ecommerce.*nginx|.*nginx.*latest" | awk '{print $3}' | xargs -r docker rmi -f 2>/dev/null || true

echo "🔨 Rebuilding nginx service..."
docker-compose -f docker-compose.prod.yml build --no-cache nginx

echo "🚀 Starting nginx service..."
docker-compose -f docker-compose.prod.yml up -d nginx

echo "⏳ Waiting for nginx to be ready..."
sleep 5

echo ""
echo "✅ Nginx service rebuilt successfully!"
echo ""
echo "📊 Checking status..."
docker-compose -f docker-compose.prod.yml ps nginx

