# Quick Setup Guide - API Server

## 🚀 Quick Start với Docker

### 1. Start PostgreSQL Database

```bash
# Từ root project
docker-compose up -d postgres

# Hoặc từ apps/api
cd ../..
docker-compose up -d postgres
```

Kiểm tra database đã chạy:
```bash
docker ps | grep postgres
```

### 2. Setup Environment

```bash
cd apps/api
cp .env.example .env
```

File `.env` đã được config sẵn cho Docker PostgreSQL.

### 3. Install Dependencies

```bash
npm install
```

### 4. Setup Database Schema

```bash
# Tạo schema từ entities
npm run schema:update

# Seed initial data (admin user, categories, stores)
npm run seed
```

### 5. Start API Server

```bash
# Development mode (với hot reload)
npm run dev

# Hoặc production mode
npm run build
npm run start:prod
```

Server sẽ chạy tại: **http://localhost:3001**

## 📝 Default Credentials

Sau khi seed database:
- **Email**: `admin@store.vn`
- **Password**: `admin123`

## 🔍 Verify Setup

### Test API Health
```bash
curl http://localhost:3001/api
```

### Test Login
```bash
curl -X POST http://localhost:3001/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin@store.vn", "password": "admin123"}'
```

### Swagger Documentation
Truy cập: **http://localhost:3001/api/docs**

## 🛠️ Useful Commands

```bash
# Database
npm run schema:update    # Update schema từ entities
npm run migration:create  # Tạo migration mới
npm run migration:up      # Chạy migrations
npm run seed              # Seed data

# Development
npm run dev               # Start với watch mode
npm run build             # Build production
npm run start:prod        # Start production

# Docker
docker-compose up -d postgres    # Start database
docker-compose down              # Stop database
docker-compose logs postgres     # Xem logs
docker-compose exec postgres psql -U postgres -d ecommerce_minimart  # Connect to DB
```

## 🐳 Docker Commands

```bash
# Start database
docker-compose up -d postgres

# Stop database
docker-compose down

# View logs
docker-compose logs -f postgres

# Restart database
docker-compose restart postgres

# Remove database (⚠️ xóa data)
docker-compose down -v
```

## ⚠️ Troubleshooting

**Database connection error:**
```bash
# Kiểm tra Docker container
docker ps | grep postgres

# Kiểm tra logs
docker-compose logs postgres

# Restart nếu cần
docker-compose restart postgres
```

**Port 5432 already in use:**
- Đổi port trong `docker-compose.yml`: `"5433:5432"`
- Update `.env`: `DB_PORT=5433`

**Module not found:**
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📚 Next Steps

1. ✅ Database đã chạy
2. ✅ API server đã start
3. 📖 Xem `API_SPEC.md` để biết full API endpoints
4. 🔐 Đổi `JWT_SECRET` trong `.env` cho production

