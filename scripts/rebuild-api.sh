#!/bin/bash

# Script để rebuild API service
# Đảm bảo postgres và minio đã chạy trước khi rebuild API
# Usage: ./scripts/rebuild-api.sh

set -e

echo "🔍 Checking required services status..."

# Check postgres
if ! docker-compose -f docker-compose.prod.yml ps postgres | grep -q "Up"; then
    echo "⚠️  PostgreSQL is not running. Starting it..."
    docker-compose -f docker-compose.prod.yml up -d postgres
    echo "⏳ Waiting for PostgreSQL to be healthy..."
    timeout=60
    elapsed=0
    while [ $elapsed -lt $timeout ]; do
        if docker-compose -f docker-compose.prod.yml ps postgres | grep -q "healthy"; then
            echo "✅ PostgreSQL is healthy!"
            break
        fi
        sleep 2
        elapsed=$((elapsed + 2))
        echo "   Waiting... (${elapsed}s/${timeout}s)"
    done
    
    if [ $elapsed -ge $timeout ]; then
        echo "❌ PostgreSQL did not become healthy within ${timeout}s"
        exit 1
    fi
elif ! docker-compose -f docker-compose.prod.yml ps postgres | grep -q "healthy"; then
    echo "⚠️  PostgreSQL is running but not healthy."
    exit 1
else
    echo "✅ PostgreSQL is running and healthy"
fi

# Check minio
if ! docker-compose -f docker-compose.prod.yml ps minio | grep -q "Up"; then
    echo "⚠️  MinIO is not running. Starting it..."
    docker-compose -f docker-compose.prod.yml up -d minio
    echo "⏳ Waiting for MinIO to be healthy..."
    timeout=60
    elapsed=0
    while [ $elapsed -lt $timeout ]; do
        if docker-compose -f docker-compose.prod.yml ps minio | grep -q "healthy"; then
            echo "✅ MinIO is healthy!"
            break
        fi
        sleep 2
        elapsed=$((elapsed + 2))
        echo "   Waiting... (${elapsed}s/${timeout}s)"
    done
    
    if [ $elapsed -ge $timeout ]; then
        echo "❌ MinIO did not become healthy within ${timeout}s"
        exit 1
    fi
elif ! docker-compose -f docker-compose.prod.yml ps minio | grep -q "healthy"; then
    echo "⚠️  MinIO is running but not healthy."
    exit 1
else
    echo "✅ MinIO is running and healthy"
fi

echo ""
echo "🧹 Cleaning Docker cache..."
docker builder prune -f || true
docker container prune -f || true

echo "🛑 Stopping API container..."
docker-compose -f docker-compose.prod.yml stop api || true

echo "🗑️  Removing API container..."
docker-compose -f docker-compose.prod.yml rm -f api || true

echo "🧹 Cleaning up old API images..."
docker images | grep -E "ecommerce.*api|.*api.*latest" | awk '{print $3}' | xargs -r docker rmi -f 2>/dev/null || true

echo "🔨 Rebuilding API service..."
docker-compose -f docker-compose.prod.yml build --no-cache api

echo "🚀 Starting API service..."
docker-compose -f docker-compose.prod.yml up -d api

echo "⏳ Waiting for API to be healthy..."
timeout=120
elapsed=0
while [ $elapsed -lt $timeout ]; do
    if docker-compose -f docker-compose.prod.yml ps api | grep -q "healthy"; then
        echo "✅ API is healthy and ready!"
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

echo ""
echo "✅ API service rebuilt successfully!"
echo ""
echo "📊 Checking status..."
docker-compose -f docker-compose.prod.yml ps api

