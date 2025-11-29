#!/bin/bash

# Simple helper to request Let's Encrypt certificates for Nginx
# Chạy script này TRÊN SERVER (host), không phải trong container.

set -e

# ====== CẦN SỬA LẠI CHO PHÙ HỢP ======
EMAIL="support@littlebox.vn"          # Email nhận thông báo từ Let's Encrypt
DOMAIN_WEB="littlebox.vn"
DOMAIN_ADMIN="admin.littlebox.vn"
DOMAIN_API="api.littlebox.vn"
DOMAIN_ASSETS="assets.littlebox.vn"
# =====================================

if ! command -v certbot >/dev/null 2>&1; then
  echo "❌ certbot chưa được cài. Cài bằng:"
  echo "  sudo apt-get update && sudo apt-get install -y certbot python3-certbot-nginx"
  exit 1
fi

echo "✅ Yêu cầu chứng chỉ SSL cho:"
echo "  - $DOMAIN_WEB"
echo "  - $DOMAIN_ADMIN"
echo "  - $DOMAIN_API"
echo "  - $DOMAIN_ASSETS"

# Tạm thời stop nginx container để certbot có thể dùng port 80
echo "⏸️  Tạm thời stop nginx container..."
docker stop ecommerce-nginx 2>/dev/null || true

# Chạy certbot với webroot plugin (không cần nginx trên host)
echo "🔐 Đang yêu cầu chứng chỉ SSL..."

# Tạo webroot directory
sudo mkdir -p /var/www/certbot

# Chạy certbot với standalone mode (không cần nginx)
sudo certbot certonly --standalone \
  -m "$EMAIL" --agree-tos --no-eff-email \
  -d "$DOMAIN_WEB" -d "www.$DOMAIN_WEB" \
  -d "$DOMAIN_ADMIN" \
  -d "$DOMAIN_API" \
  -d "$DOMAIN_ASSETS" \
  --preferred-challenges http

# Start lại nginx container
echo "▶️  Start lại nginx container..."
docker start ecommerce-nginx 2>/dev/null || docker-compose -f docker-compose.prod.yml up -d nginx

echo "✅ Hoàn tất. Certificates đã được tạo tại /etc/letsencrypt/live/"
echo "📝 Cần cấu hình nginx để sử dụng certificates này."
echo "   Xem hướng dẫn trong DOMAIN_SETUP.md"


