# Domain Setup Guide

Hướng dẫn cấu hình domain cho production deployment.

## Cấu hình Domain

### 1. Cập nhật file `.env`

Mở file `.env` và cập nhật các domain:

```env
# Domain Configuration
WEB_DOMAIN=yourdomain.com
ADMIN_DOMAIN=admin.yourdomain.com
API_DOMAIN=api.yourdomain.com
```

### 2. Cập nhật Nginx Config

Sau khi cập nhật `.env`, chạy script để tự động update nginx config:

```bash
chmod +x scripts/update-domains.sh
./scripts/update-domains.sh
```

Script này sẽ:
- Đọc domain từ `.env`
- Thay thế các biến trong `nginx/nginx.conf.template`
- Tạo file `nginx/nginx.conf` mới

### 3. Manual Update (Nếu không dùng script)

Nếu muốn tự chỉnh sửa, mở file `nginx/nginx.conf` và thay thế:

- `${WEB_DOMAIN}` → domain của bạn (ví dụ: `yourdomain.com`)
- `${ADMIN_DOMAIN}` → admin domain (ví dụ: `admin.yourdomain.com`)
- `${API_DOMAIN}` → API domain (ví dụ: `api.yourdomain.com`)

## DNS Configuration

Sau khi cấu hình domain, cần setup DNS records:

### Option 1: Tất cả subdomain trỏ về cùng IP

```
A     @              → YOUR_SERVER_IP
A     www            → YOUR_SERVER_IP
A     admin          → YOUR_SERVER_IP
A     api            → YOUR_SERVER_IP
```

### Option 2: Chỉ main domain và admin

```
A     @              → YOUR_SERVER_IP
A     www            → YOUR_SERVER_IP
A     admin          → YOUR_SERVER_IP
CNAME api            → yourdomain.com (hoặc trỏ về IP)
```

## SSL/HTTPS Setup

Sau khi domain đã trỏ đúng, setup SSL:

### Sử dụng Let's Encrypt (Certbot)

```bash
# Install certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Get certificates
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
sudo certbot --nginx -d admin.yourdomain.com
sudo certbot --nginx -d api.yourdomain.com
```

### Update nginx config cho HTTPS

Thêm vào `nginx/nginx.conf`:

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # ... rest of config
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

## CORS Configuration

Sau khi có domain, cập nhật CORS trong `.env`:

```env
CORS_ORIGIN=https://yourdomain.com,https://admin.yourdomain.com,https://www.yourdomain.com
```

## Frontend URLs

Cập nhật frontend URLs trong `.env`:

```env
VITE_API_URL=https://api.yourdomain.com/api
VITE_SITE_URL=https://yourdomain.com
```

Sau đó rebuild frontend containers:

```bash
docker-compose -f docker-compose.prod.yml up -d --build web admin
```

## Verification

Sau khi setup xong, kiểm tra:

1. **Web**: https://yourdomain.com
2. **Admin**: https://admin.yourdomain.com
3. **API**: https://api.yourdomain.com/api
4. **API Docs**: https://api.yourdomain.com/api/docs

## Troubleshooting

### Domain không resolve:
- Kiểm tra DNS records đã propagate chưa: `dig yourdomain.com`
- Kiểm tra firewall đã mở port 80, 443 chưa

### SSL errors:
- Kiểm tra certificates: `sudo certbot certificates`
- Renew certificates: `sudo certbot renew`

### CORS errors:
- Kiểm tra CORS_ORIGIN trong `.env` đã đúng chưa
- Restart API container: `docker-compose restart api`


