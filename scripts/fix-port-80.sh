#!/bin/bash

# Script để dừng các service đang dùng port 80
# Chạy script này TRÊN SERVER trước khi start docker-compose

set -e

echo "🔍 Kiểm tra port 80..."

# Kiểm tra nginx system service
if systemctl is-active --quiet nginx 2>/dev/null; then
    echo "⏸️  Dừng nginx system service..."
    sudo systemctl stop nginx
    sudo systemctl disable nginx
    echo "✅ Đã dừng nginx system service"
fi

# Kiểm tra và dừng container nginx cũ
if docker ps -a --format '{{.Names}}' | grep -q '^ecommerce-nginx$'; then
    echo "⏸️  Dừng container nginx cũ..."
    docker stop ecommerce-nginx 2>/dev/null || true
    docker rm ecommerce-nginx 2>/dev/null || true
    echo "✅ Đã dừng và xóa container nginx cũ"
fi

# Kiểm tra các container khác đang dùng port 80
PORT_80_USERS=$(docker ps --format '{{.Names}}' | xargs -I {} sh -c 'docker port {} 2>/dev/null | grep -q ":80->" && echo {}' || true)

if [ -n "$PORT_80_USERS" ]; then
    echo "⚠️  Tìm thấy container khác đang dùng port 80:"
    echo "$PORT_80_USERS"
    echo "⏸️  Đang dừng các container này..."
    echo "$PORT_80_USERS" | xargs -r docker stop
    echo "✅ Đã dừng các container"
fi

# Kiểm tra process khác đang dùng port 80
if command -v lsof >/dev/null 2>&1; then
    PORT_80_PROC=$(sudo lsof -ti:80 2>/dev/null || true)
    if [ -n "$PORT_80_PROC" ]; then
        echo "⚠️  Tìm thấy process khác đang dùng port 80: $PORT_80_PROC"
        echo "⏸️  Đang dừng process..."
        sudo kill -9 $PORT_80_PROC 2>/dev/null || true
        echo "✅ Đã dừng process"
    fi
fi

echo ""
echo "✅ Port 80 đã được giải phóng. Có thể chạy docker-compose up -d"

