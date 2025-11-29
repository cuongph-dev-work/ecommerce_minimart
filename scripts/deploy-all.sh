#!/bin/bash

# Script để deploy tất cả services theo thứ tự
# Quy trình: Start postgres & minio → Start API → Build & Start nginx → Build & Start web_ssr → Build & Start admin
# Nginx phải start sau API và trước web_ssr vì build Next.js cần gọi API qua nginx
# Usage: ./scripts/deploy-all.sh

set -e

echo "=========================================="
echo "🚀 Deploying all services..."
echo "=========================================="
echo ""

# Step 1: Start PostgreSQL
echo "📦 Step 1: Starting PostgreSQL database..."
if ! docker-compose -f docker-compose.prod.yml ps postgres | grep -q "Up"; then
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
else
    echo "✅ PostgreSQL is already running"
fi

# Step 2: Start MinIO
echo ""
echo "📦 Step 2: Starting MinIO object storage..."
if ! docker-compose -f docker-compose.prod.yml ps minio | grep -q "Up"; then
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
else
    echo "✅ MinIO is already running"
fi

# Step 3: Stop and remove containers (except postgres and minio)
echo ""
echo "🛑 Step 3: Stopping application containers..."
docker-compose -f docker-compose.prod.yml stop api web_ssr admin nginx || true

echo "🗑️  Removing application containers..."
docker-compose -f docker-compose.prod.yml rm -f api web_ssr admin nginx || true

# Step 4: Start API
echo ""
echo "🚀 Step 4: Starting API service..."
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

# Step 5: Build and start nginx (sau API, trước web_ssr)
echo ""
echo "🔨 Step 5: Rebuilding nginx service..."
docker-compose -f docker-compose.prod.yml build --no-cache nginx

echo "🚀 Starting nginx service (reverse proxy) - needed for web_ssr build to call API..."
docker-compose -f docker-compose.prod.yml up -d nginx

# Đợi nginx sẵn sàng
echo "⏳ Waiting for nginx to be ready..."
sleep 5

# Step 6: Build and start web_ssr (sau nginx, có thể gọi API qua nginx trong quá trình build)
echo ""
echo "🔨 Step 6: Rebuilding web_ssr service..."
echo "🧹 Cleaning up old web_ssr images..."
docker images | grep -E "ecommerce.*web-ssr|.*web-ssr.*latest" | awk '{print $3}' | xargs -r docker rmi -f 2>/dev/null || true

docker-compose -f docker-compose.prod.yml build --no-cache web_ssr

echo "🚀 Starting web_ssr service..."
docker-compose -f docker-compose.prod.yml up -d web_ssr

# Step 7: Build and start admin
echo ""
echo "🔨 Step 7: Rebuilding admin service..."
docker-compose -f docker-compose.prod.yml build --no-cache admin

echo "🚀 Starting admin service..."
docker-compose -f docker-compose.prod.yml up -d admin

# Step 8: Restart nginx để cập nhật với web_ssr và admin đã start
echo ""
echo "🔄 Step 8: Restarting nginx to update with web_ssr and admin..."
docker-compose -f docker-compose.prod.yml restart nginx

echo ""
echo "=========================================="
echo "✅ All services deployed successfully!"
echo "=========================================="
echo ""
echo "📊 Services status:"
docker-compose -f docker-compose.prod.yml ps

