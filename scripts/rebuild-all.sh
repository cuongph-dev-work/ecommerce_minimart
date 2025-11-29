#!/bin/bash

# Script để rebuild tất cả services
# Usage: ./scripts/rebuild-all.sh

set -e

echo "🔄 Rebuilding all services..."
echo ""

echo "🛑 Stopping all containers..."
docker-compose -f docker-compose.prod.yml stop || true

echo "🗑️  Removing all containers..."
docker-compose -f docker-compose.prod.yml rm -f || true

echo "🔨 Rebuilding all services (this may take a while)..."
docker-compose -f docker-compose.prod.yml build --no-cache

echo "🚀 Starting all services..."
docker-compose -f docker-compose.prod.yml up -d

echo "✅ All services rebuilt successfully!"
echo ""
echo "📊 Checking status..."
docker-compose -f docker-compose.prod.yml ps

