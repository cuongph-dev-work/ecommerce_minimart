#!/bin/bash

# Script để rebuild web_ssr service
# Usage: ./scripts/rebuild-web.sh

set -e

echo "🛑 Stopping web_ssr container..."
docker-compose -f docker-compose.prod.yml stop web_ssr || true

echo "🗑️  Removing web_ssr container..."
docker-compose -f docker-compose.prod.yml rm -f web_ssr || true

echo "🧹 Cleaning up old web_ssr images..."
docker images | grep -E "ecommerce.*web-ssr|.*web-ssr.*latest" | awk '{print $3}' | xargs -r docker rmi -f 2>/dev/null || true

echo "🔨 Rebuilding web_ssr service..."
docker-compose -f docker-compose.prod.yml build --no-cache web_ssr

echo "🚀 Starting web_ssr service..."
docker-compose -f docker-compose.prod.yml up -d web_ssr

echo "✅ Web SSR service rebuilt successfully!"
echo ""
echo "📊 Checking status..."
docker-compose -f docker-compose.prod.yml ps web_ssr

