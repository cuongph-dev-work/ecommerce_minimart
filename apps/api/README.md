# E-commerce Minimart API

Backend API built with NestJS 11, MikroORM, and PostgreSQL.

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

```bash
cd apps/api
./scripts/setup.sh
npm run dev
```

### Option 2: Manual Setup

1. **Start PostgreSQL Database:**
```bash
# From project root
docker-compose up -d postgres
```

2. **Create .env file:**
```bash
cp .env.example .env
```

3. **Install dependencies:**
```bash
npm install
```

4. **Setup database:**
```bash
npm run schema:update
npm run seed
```

5. **Start server:**
```bash
npm run dev
```

## 📝 Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Database (Docker)
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=ecommerce_minimart

# JWT
JWT_SECRET=your-secret-key

# Server
PORT=3001
API_PREFIX=api
```

## 🐳 Docker Commands

```bash
# Start database
npm run db:up
# or
docker-compose -f ../../docker-compose.yml up -d postgres

# Stop database
npm run db:down

# View logs
npm run db:logs
```

## 📚 API Documentation

- **Swagger UI**: http://localhost:3001/api/docs (when `SWAGGER_ENABLED=true`)
- **API Spec**: See `API_SPEC.md` in project root

## 🔑 Default Credentials

After seeding:
- **Email**: `admin@store.vn`
- **Password**: `admin123`

## 🛠️ Available Scripts

```bash
# Development
npm run dev              # Start with watch mode
npm run build            # Build for production
npm run start:prod       # Start production server

# Database
npm run schema:update    # Update schema from entities
npm run migration:create # Create new migration
npm run migration:up     # Run migrations
npm run seed             # Seed database

# Docker helpers
npm run db:up            # Start PostgreSQL
npm run db:down          # Stop PostgreSQL
npm run db:logs          # View database logs

# Setup (all-in-one)
npm run setup            # Install + schema + seed
```

## 📖 Documentation

- [Setup Guide](./SETUP.md) - Detailed setup instructions
- [Deployment Guide](./DEPLOYMENT.md) - Production deployment
- [API Specification](../../API_SPEC.md) - Full API documentation

## 🏗️ Project Structure

```
src/
├── config/          # Configuration files
├── database/        # Database module & migrations
├── entities/         # MikroORM entities
├── modules/         # Feature modules
│   ├── auth/        # Authentication
│   ├── products/    # Products management
│   ├── orders/      # Orders management
│   └── ...
├── common/          # Shared utilities
└── main.ts          # Application entry point
```

## ⚠️ Troubleshooting

**Database connection error:**
- Ensure PostgreSQL container is running: `docker ps | grep postgres`
- Check `.env` file has correct credentials
- View logs: `docker-compose logs postgres`

**Port already in use:**
- Change `PORT` in `.env` or stop the conflicting service

**Module not found:**
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📄 License

Private project
