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

# Kiểm tra DNS trước
echo ""
echo "🔍 Kiểm tra DNS configuration..."
SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s ipinfo.io/ip 2>/dev/null || hostname -I | awk '{print $1}' || echo "unknown")

if [ "$SERVER_IP" = "unknown" ]; then
    echo "⚠️  Không thể xác định server IP. Vui lòng nhập server IP:"
    read -p "Server IP: " SERVER_IP
fi

echo "📍 Server IP: $SERVER_IP"
echo ""

check_dns() {
    local domain=$1
    local dns_result=$(dig +short $domain 2>/dev/null | grep -E '^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$' | head -1)
    
    if [ -z "$dns_result" ]; then
        echo "  ❌ $domain: Không tìm thấy A record"
        return 1
    elif [ "$dns_result" != "$SERVER_IP" ]; then
        echo "  ⚠️  $domain: DNS trỏ về $dns_result (khác với server IP: $SERVER_IP)"
        return 1
    else
        echo "  ✅ $domain: DNS đã trỏ đúng về $SERVER_IP"
        return 0
    fi
}

DNS_OK=true
check_dns "$DOMAIN_WEB" || DNS_OK=false
check_dns "www.$DOMAIN_WEB" || DNS_OK=false
check_dns "$DOMAIN_ADMIN" || DNS_OK=false
check_dns "$DOMAIN_API" || DNS_OK=false
check_dns "$DOMAIN_ASSETS" || DNS_OK=false

if [ "$DNS_OK" = false ]; then
    echo ""
    echo "❌ DNS chưa được cấu hình đúng!"
    echo ""
    echo "📝 Cần cấu hình DNS records trỏ về server IP: $SERVER_IP"
    echo ""
    echo "DNS records cần thiết (trong DNS provider của bạn):"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Type  Name      Value"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "A     @         $SERVER_IP"
    echo "A     www       $SERVER_IP"
    echo "A     admin     $SERVER_IP"
    echo "A     api       $SERVER_IP"
    echo "A     assets    $SERVER_IP"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Sau khi cấu hình DNS:"
    echo "  1. Đợi 5-30 phút để DNS propagate"
    echo "  2. Kiểm tra: dig littlebox.vn"
    echo "  3. Chạy lại script này: bash scripts/setup-ssl.sh"
    echo ""
    exit 1
fi

echo ""
echo "✅ DNS đã được cấu hình đúng. Tiếp tục..."

# Tạm thời stop nginx container để certbot có thể dùng port 80
echo "⏸️  Tạm thời stop nginx container..."
docker stop ecommerce-nginx 2>/dev/null || true

# Chạy certbot với webroot plugin (không cần nginx trên host)
echo "🔐 Đang yêu cầu chứng chỉ SSL..."

# Tạo webroot directory
sudo mkdir -p /var/www/certbot

# Chạy certbot với standalone mode cho từng domain
# Request certificate cho web domain (bao gồm www)
sudo certbot certonly --standalone \
  -m "$EMAIL" --agree-tos --no-eff-email \
  -d "$DOMAIN_WEB" -d "www.$DOMAIN_WEB" \
  --preferred-challenges http \
  --cert-name "$DOMAIN_WEB"

# Request certificate cho admin domain
sudo certbot certonly --standalone \
  -m "$EMAIL" --agree-tos --no-eff-email \
  -d "$DOMAIN_ADMIN" \
  --preferred-challenges http \
  --cert-name "$DOMAIN_ADMIN"

# Request certificate cho API domain
sudo certbot certonly --standalone \
  -m "$EMAIL" --agree-tos --no-eff-email \
  -d "$DOMAIN_API" \
  --preferred-challenges http \
  --cert-name "$DOMAIN_API"

# Request certificate cho assets domain
sudo certbot certonly --standalone \
  -m "$EMAIL" --agree-tos --no-eff-email \
  -d "$DOMAIN_ASSETS" \
  --preferred-challenges http \
  --cert-name "$DOMAIN_ASSETS"

# Start lại nginx container
echo "▶️  Start lại nginx container..."
docker start ecommerce-nginx 2>/dev/null || docker-compose -f docker-compose.prod.yml up -d nginx

echo "✅ Hoàn tất. Certificates đã được tạo tại /etc/letsencrypt/live/"
echo "📝 Cần cấu hình nginx để sử dụng certificates này."
echo "   Xem hướng dẫn trong DOMAIN_SETUP.md"


