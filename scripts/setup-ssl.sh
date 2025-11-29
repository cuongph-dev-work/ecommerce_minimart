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

sudo certbot --nginx \
  -m "$EMAIL" --agree-tos --no-eff-email \
  -d "$DOMAIN_WEB" -d "www.$DOMAIN_WEB" \
  -d "$DOMAIN_ADMIN" \
  -d "$DOMAIN_API" \
  -d "$DOMAIN_ASSETS"

echo "✅ Hoàn tất. Kiểm tra lại cấu hình Nginx và HTTPS trên các domain trên."


