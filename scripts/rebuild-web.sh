#!/bin/bash

# Script để rebuild web_ssr service
# Đảm bảo API đã chạy trước khi build và start web_ssr
# Usage: ./scripts/rebuild-web.sh

set -e

echo "🔍 Checking required services status..."
services_ok=true

# Check postgres
if ! docker-compose -f docker-compose.prod.yml ps postgres | grep -q "Up"; then
    echo "⚠️  PostgreSQL is not running."
    services_ok=false
elif ! docker-compose -f docker-compose.prod.yml ps postgres | grep -q "healthy"; then
    echo "⚠️  PostgreSQL is running but not healthy."
    services_ok=false
fi

# Check minio
if ! docker-compose -f docker-compose.prod.yml ps minio | grep -q "Up"; then
    echo "⚠️  MinIO is not running."
    services_ok=false
elif ! docker-compose -f docker-compose.prod.yml ps minio | grep -q "healthy"; then
    echo "⚠️  MinIO is running but not healthy."
    services_ok=false
fi

# Check API
if ! docker-compose -f docker-compose.prod.yml ps api | grep -q "Up"; then
    echo "⚠️  API service is not running."
    services_ok=false
elif ! docker-compose -f docker-compose.prod.yml ps api | grep -q "healthy"; then
    echo "⚠️  API service is running but not healthy yet."
    echo "⏳ Waiting for API to become healthy..."
    timeout=60
    elapsed=0
    while [ $elapsed -lt $timeout ]; do
        if docker-compose -f docker-compose.prod.yml ps api | grep -q "healthy"; then
            echo "✅ API is healthy!"
            break
        fi
        sleep 2
        elapsed=$((elapsed + 2))
        echo "   Waiting... (${elapsed}s/${timeout}s)"
    done
    
    if [ $elapsed -ge $timeout ]; then
        echo "❌ API did not become healthy within ${timeout}s"
        exit 1
    fi
fi

if [ "$services_ok" = false ]; then
    echo ""
    echo "💡 Please run './scripts/start-api.sh' first to start all required services (postgres, minio, api)."
    exit 1
else
    echo "✅ All required services (postgres, minio, api) are running and healthy"
fi

echo ""
echo "🧹 Cleaning Docker cache..."
docker builder prune -f || true
docker container prune -f || true

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

