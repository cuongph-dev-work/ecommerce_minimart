# Docker Deployment Guide

Hướng dẫn deploy toàn bộ hệ thống E-commerce Minimart bằng Docker với 1 command.

## Prerequisites

- Docker >= 20.10
- Docker Compose >= 2.0
- ít nhất 4GB RAM
- ít nhất 10GB disk space

## Quick Start

1. **Clone repository và copy environment file:**

```bash
cp .env.example .env
```

2. **Chỉnh sửa `.env` với các giá trị production:**

```bash
# Đặc biệt quan trọng:
# - JWT_SECRET: Tạo random string mạnh
# - DB_PASSWORD: Password database an toàn
# - MINIO_ROOT_PASSWORD: Password MinIO an toàn
# - CORS_ORIGIN: Domain thực tế của bạn
```

3. **Build và start tất cả services:**

```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

4. **Kiểm tra logs:**

```bash
docker-compose -f docker-compose.prod.yml logs -f
```

5. **Chạy database migrations và seed:**

```bash
# Vào container API
docker exec -it ecommerce-api sh

# Chạy migrations
npm run migration:up

# Seed initial data
npm run seed

# Exit container
exit
```

## Services

Sau khi deploy, các services sẽ chạy tại:

- **Web Frontend**: http://localhost (hoặc domain của bạn)
- **Admin Panel**: http://localhost/admin
- **API**: http://localhost/api
- **API Docs (nếu enabled)**: http://localhost/api/docs
- **MinIO Console**: http://localhost:9001
- **PostgreSQL**: localhost:5432

## Domain Configuration

Cấu hình domain trong file `.env`:

```env
# Domain Configuration
DOMAIN=littlebox.vn
WEB_DOMAIN=littlebox.vn
ADMIN_DOMAIN=admin.littlebox.vn
API_DOMAIN=api.littlebox.vn
ASSETS_DOMAIN=assets.littlebox.vn
```

Sau khi cập nhật domain, chạy script để update nginx config:

```bash
chmod +x scripts/update-domains.sh
./scripts/update-domains.sh
```

Hoặc tự động update khi deploy (script sẽ tự chạy nếu có envsubst).

## Environment Variables

Xem `.env.example` để biết tất cả các biến môi trường cần thiết.

### Quan trọng cho Production:

1. **JWT_SECRET**: Tạo bằng:
   ```bash
   openssl rand -base64 32
   ```

2. **DB_PASSWORD**: Password mạnh cho PostgreSQL

3. **Domain Configuration**: Cập nhật trong `.env`:
   ```
   WEB_DOMAIN=littlebox.vn
   ADMIN_DOMAIN=admin.littlebox.vn
   API_DOMAIN=api.littlebox.vn
   ASSETS_DOMAIN=assets.littlebox.vn
   ```
   Sau đó chạy: `./scripts/update-domains.sh` để update nginx config

4. **CORS_ORIGIN**: Danh sách domain được phép, ví dụ:
   ```
   CORS_ORIGIN=https://littlebox.vn,https://admin.littlebox.vn
   ```

5. **VITE_API_URL**: URL API public, ví dụ:
   ```
   VITE_API_URL=https://api.littlebox.vn/api
   ```

6. **VITE_SITE_URL**: URL website public, ví dụ:
   ```
   VITE_SITE_URL=https://littlebox.vn
   ```

## Commands

### Start services:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Stop services:
```bash
docker-compose -f docker-compose.prod.yml down
```

### View logs:
```bash
# Tất cả services
docker-compose -f docker-compose.prod.yml logs -f

# Chỉ API
docker-compose -f docker-compose.prod.yml logs -f api

# Chỉ Web
docker-compose -f docker-compose.prod.yml logs -f web
```

### Rebuild services:
```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

### Restart một service:
```bash
docker-compose -f docker-compose.prod.yml restart api
```

### Execute commands trong container:
```bash
# API container
docker exec -it ecommerce-api sh

# Database container
docker exec -it ecommerce-postgres psql -U postgres -d ecommerce_minimart
```

### View resource usage:
```bash
docker stats
```

## Database Management

### Backup database:
```bash
docker exec ecommerce-postgres pg_dump -U postgres ecommerce_minimart > backup.sql
```

### Restore database:
```bash
docker exec -i ecommerce-postgres psql -U postgres ecommerce_minimart < backup.sql
```

### Run migrations:
```bash
docker exec -it ecommerce-api npm run migration:up
```

### Run seeders:
```bash
docker exec -it ecommerce-api npm run seed
```

## Troubleshooting

### Services không start:
```bash
# Kiểm tra logs
docker-compose -f docker-compose.prod.yml logs

# Kiểm tra status
docker-compose -f docker-compose.prod.yml ps
```

### API không kết nối database:
- Kiểm tra DB_HOST=postgres trong .env
- Kiểm tra postgres service đã healthy chưa: `docker ps`
- Kiểm tra network: `docker network ls`

### Frontend không load:
- Kiểm tra nginx logs: `docker logs ecommerce-nginx`
- Kiểm tra web/admin containers: `docker ps`
- Kiểm tra build có thành công không

### Port conflicts:
- Thay đổi ports trong `.env` hoặc `docker-compose.prod.yml`
- Kiểm tra ports đang dùng: `lsof -i :80`

## Production Checklist

- [ ] Đổi tất cả passwords trong `.env`
- [ ] Set JWT_SECRET mạnh
- [ ] Configure CORS_ORIGIN đúng domain
- [ ] Setup SSL/HTTPS (cần thêm nginx SSL config)
- [ ] Setup domain names trong nginx config
- [ ] Disable Swagger trong production (SWAGGER_ENABLED=false)
- [ ] Setup database backups tự động
- [ ] Configure log rotation
- [ ] Setup monitoring (Prometheus, Grafana, etc)
- [ ] Setup file storage backup (MinIO hoặc S3)

## Scaling

Để scale services:

```bash
# Scale API instances
docker-compose -f docker-compose.prod.yml up -d --scale api=3

# Scale Web instances
docker-compose -f docker-compose.prod.yml up -d --scale web=2
```

## SSL/HTTPS Setup

Để setup SSL, cần:

1. Thêm SSL certificates vào nginx
2. Update nginx config để listen port 443
3. Redirect HTTP to HTTPS

Xem thêm: https://nginx.org/en/docs/http/configuring_https_servers.html

## Monitoring

Có thể thêm monitoring services:

- **Prometheus**: Metrics collection
- **Grafana**: Visualization
- **ELK Stack**: Log aggregation

## Support

Nếu gặp vấn đề, kiểm tra:
1. Docker logs: `docker-compose -f docker-compose.prod.yml logs`
2. Container status: `docker ps -a`
3. Network: `docker network inspect ecommerce_minimart_ecommerce-network`

