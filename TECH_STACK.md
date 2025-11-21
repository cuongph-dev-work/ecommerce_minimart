# TECH STACK - BACKEND (NESTJS)

## 1. TỔNG QUAN

Tài liệu này mô tả chi tiết về tech stack cho **Backend API** của dự án E-commerce Minimart:
- **Framework**: NestJS 11 với TypeScript
- **Database**: PostgreSQL với Prisma ORM hoặc MikroORM
- **File Storage**: Local disk storage
- **Infrastructure**: Docker, CI/CD

---

## 2. BACKEND STACK

### 2.1. Core Framework

**NestJS** - Progressive Node.js framework
- **Version**: `^11.0.0` (Latest: 11.1.9)
- **Node.js Requirement**: `>=20.0.0`
- **Lý do chọn**: 
  - TypeScript-first, type-safe
  - Modular architecture (modules, controllers, services)
  - Built-in dependency injection
  - Excellent for building scalable APIs
  - Strong ecosystem và community support
  - Latest version với performance improvements và security updates

**TypeScript**
- **Version**: `^5.6.0`
- **Lý do**: Type safety, better IDE support, improved developer experience, latest features

### 2.2. Database & ORM

#### Option 1: Prisma (Khuyến nghị)

**Prisma** - Next-generation ORM
- **Version**: `^6.0.0` (Latest: 6.x)
- **Lý do chọn**:
  - Type-safe database client
  - Excellent developer experience với Prisma Studio
  - Auto-generated types từ schema
  - Migration system mạnh mẽ
  - Query builder dễ sử dụng
  - Support cho PostgreSQL, MySQL, SQLite, MongoDB
  - Full compatibility với NestJS 11

**PostgreSQL**
- **Version**: `15+`
- **Lý do**: 
  - ACID compliance
  - JSON/JSONB support
  - Full-text search
  - Excellent performance
  - Open source và mature

**Cấu trúc Prisma:**
```
prisma/
├── schema.prisma          # Database schema definition
├── migrations/            # Migration files
└── seed.ts               # Database seeding
```

**Ví dụ Schema:**
```prisma
model Product {
  id          String   @id @default(uuid())
  name        String
  description String?
  price       Decimal  @db.Decimal(10, 2)
  stock       Int      @default(0)
  categoryId  String
  category    Category @relation(fields: [categoryId], references: [id])
  images      String[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([categoryId])
  @@index([name])
}
```

#### Option 2: MikroORM

**MikroORM** - TypeScript ORM
- **Version**: `^6.0.0`
- **Lý do chọn**:
  - TypeScript-first với decorators
  - Unit of Work pattern
  - Identity Map pattern
  - Support nhiều database drivers
  - Migration system tốt
  - Entity Manager pattern

**Cấu trúc MikroORM:**
```
src/
├── entities/              # Entity definitions
│   ├── Product.entity.ts
│   └── Category.entity.ts
├── migrations/           # Migration files
└── config.ts            # MikroORM config
```

**Ví dụ Entity:**
```typescript
import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { Category } from './Category.entity';

@Entity()
export class Product {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'uuid_generate_v4()' })
  id!: string;

  @Property()
  name!: string;

  @Property({ nullable: true })
  description?: string;

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Property({ default: 0 })
  stock!: number;

  @ManyToOne(() => Category)
  category!: Category;

  @Property({ type: 'array' })
  images: string[] = [];

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
```

### 2.3. Authentication & Authorization

**@nestjs/jwt** - JWT authentication
- **Version**: `^11.0.0`
- **Lý do**: Stateless authentication, scalable, compatible với NestJS 11

**@nestjs/passport** - Authentication middleware
- **Version**: `^11.0.0`
- **Strategies**: JWT, Local (cho admin login)

**bcrypt** - Password hashing
- **Version**: `^5.0.0`
- **Lý do**: Secure password hashing

### 2.4. Validation

**class-validator** - Decorator-based validation
- **Version**: `^0.14.1`
- **Lý do**: Type-safe validation, decorator-based, latest bug fixes

**class-transformer** - Object transformation
- **Version**: `^0.5.1`
- **Lý do**: Transform và validate DTOs, latest improvements

### 2.5. File Upload & Storage

**@nestjs/platform-express** - Express adapter
- **Version**: `^11.0.0`
- **Lý do**: Built-in với NestJS 11, latest performance improvements

**multer** - File upload middleware
- **Version**: `^1.4.5-lts.1`
- **Lý do**: Handle multipart/form-data, LTS version
- **Storage**: Disk storage (local filesystem)

**sharp** - Image processing
- **Version**: `^0.33.0`
- **Lý do**: Resize, optimize images, latest performance improvements
- **Features**: 
  - Auto-resize images (thumbnail, medium, large)
  - Format conversion (WebP optimization)
  - Image compression

**fs-extra** - Enhanced file system
- **Version**: `^11.2.0`
- **Lý do**: Better file operations, promise-based API

**Storage Strategy:**
- **Local Disk Storage**: Files được lưu trực tiếp vào server filesystem
- **Directory Structure**:
  ```
  uploads/
  ├── products/          # Product images
  │   ├── original/      # Original images
  │   ├── thumbnail/     # Thumbnail (150x150)
  │   ├── medium/        # Medium (500x500)
  │   └── large/         # Large (1200x1200)
  ├── banners/           # Banner images
  │   ├── original/
  │   └── optimized/     # Optimized for slider
  ├── categories/        # Category images
  │   ├── original/
  │   └── thumbnail/
  └── stores/           # Store images
      └── original/
  ```
- **File Naming**: UUID-based naming để tránh conflict
- **Path Configuration**: Configurable qua environment variables

### 2.6. API Documentation

**@nestjs/swagger** - OpenAPI/Swagger
- **Version**: `^8.0.0`
- **Lý do**: Auto-generate API documentation từ decorators, compatible với NestJS 11

### 2.7. Configuration

**@nestjs/config** - Configuration module
- **Version**: `^3.3.0`
- **Lý do**: Environment variables management, compatible với NestJS 11

**dotenv** - Environment variables
- **Version**: `^16.4.0`
- **Lý do**: Latest security updates

### 2.8. Caching

**@nestjs/cache-manager** - Caching
- **Version**: `^2.2.0`
- **Cache Store**: Redis (production) hoặc in-memory (development)
- **Compatible**: NestJS 11

**redis** - Redis client
- **Version**: `^4.7.0`
- **Lý do**: Latest features và bug fixes

### 2.9. Logging

**@nestjs/common** - Built-in Logger
- **Lý do**: Structured logging

**winston** (optional) - Advanced logging
- **Version**: `^3.10.0`
- **Lý do**: File logging, log rotation

### 2.10. Testing

**@nestjs/testing** - Testing utilities
- **Version**: `^10.0.0`

**jest** - Testing framework
- **Version**: `^29.0.0`
- **Lý do**: Built-in với NestJS, excellent TypeScript support

**supertest** - HTTP assertions
- **Version**: `^6.3.0`
- **Lý do**: API testing

### 2.11. Error Handling

**@nestjs/common** - Built-in exception filters
- **Lý do**: Global exception handling

**Custom Exception Filters** - Business logic errors

### 2.12. Rate Limiting

**@nestjs/throttler** - Rate limiting
- **Version**: `^6.0.0`
- **Lý do**: Prevent abuse, DDoS protection, compatible với NestJS 11

### 2.13. Task Scheduling

**@nestjs/schedule** - Task scheduling
- **Version**: `^4.1.0`
- **Lý do**: Cron jobs, scheduled tasks (ví dụ: update flash sale status), compatible với NestJS 11

---

## 3. DATABASE SCHEMA DESIGN

### 3.1. Core Entities

**Users**
- id, email, password, name, phone, role, createdAt, updatedAt

**Products**
- id, name, description, price, stock, categoryId, brand, sku, images, status, featured, createdAt, updatedAt

**Categories**
- id, name, slug, icon, parentId, description, image, status, sortOrder, createdAt, updatedAt

**Orders**
- id, orderNumber, customerId, status, total, subtotal, discount, paymentMethod, paymentStatus, pickupStoreId, createdAt, updatedAt

**OrderItems**
- id, orderId, productId, quantity, price, subtotal

**Banners**
- id, title, description, image, link, status, sortOrder, createdAt, updatedAt

**FlashSales**
- id, name, startTime, endTime, status, createdAt, updatedAt

**FlashSaleProducts**
- id, flashSaleId, productId, originalPrice, salePrice, discount, total, sold

**Vouchers**
- id, code, title, description, type, discount, maxDiscount, minPurchase, maxUses, usedCount, expiryDate, status, createdAt, updatedAt

**Stores**
- id, name, address, lat, lng, phone, email, workingHours, services, allowPickup, preparationTime, status, createdAt, updatedAt

**Reviews**
- id, productId, userId, rating, comment, status, adminResponse, helpful, createdAt, updatedAt

### 3.2. Relationships

- **Product** ↔ **Category**: Many-to-One
- **Product** ↔ **OrderItem**: One-to-Many
- **Order** ↔ **OrderItem**: One-to-Many
- **Order** ↔ **User**: Many-to-One
- **Order** ↔ **Store**: Many-to-One (pickup location)
- **FlashSale** ↔ **FlashSaleProduct**: One-to-Many
- **FlashSaleProduct** ↔ **Product**: Many-to-One
- **Review** ↔ **Product**: Many-to-One
- **Review** ↔ **User**: Many-to-One
- **Category** ↔ **Category**: Self-referencing (parent-child)

---

## 4. PROJECT STRUCTURE

### 4.1. NestJS Structure

```
apps/api/
├── src/
│   ├── main.ts                    # Application entry point
│   ├── app.module.ts              # Root module
│   ├── common/                    # Shared modules
│   │   ├── decorators/
│   │   ├── filters/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   └── pipes/
│   ├── config/                    # Configuration
│   ├── database/                  # Database setup
│   │   ├── prisma.service.ts      # Prisma service (nếu dùng Prisma)
│   │   └── migrations/            # Migration files
│   ├── modules/
│   │   ├── auth/                   # Authentication
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── strategies/
│   │   │   └── dto/
│   │   ├── products/              # Products module
│   │   │   ├── products.module.ts
│   │   │   ├── products.controller.ts
│   │   │   ├── products.service.ts
│   │   │   ├── entities/          # Prisma models hoặc MikroORM entities
│   │   │   └── dto/
│   │   ├── categories/             # Categories module
│   │   ├── orders/                 # Orders module
│   │   ├── banners/                # Banners module
│   │   ├── flash-sales/            # Flash Sales module
│   │   ├── vouchers/               # Vouchers module
│   │   ├── stores/                 # Stores module
│   │   ├── reviews/                # Reviews module
│   │   ├── users/                  # Users module
│   │   └── settings/               # Settings module
│   └── upload/                     # File upload module
├── prisma/                         # Prisma schema (nếu dùng Prisma)
│   ├── schema.prisma
│   └── migrations/
├── test/                           # E2E tests
├── .env                            # Environment variables
├── .env.example
├── nest-cli.json
└── package.json
```

### 4.2. Module Pattern

Mỗi module follow pattern:
```
module-name/
├── module-name.module.ts           # Module definition
├── module-name.controller.ts       # REST endpoints
├── module-name.service.ts         # Business logic
├── entities/                       # Database entities
├── dto/                           # Data Transfer Objects
│   ├── create-module-name.dto.ts
│   ├── update-module-name.dto.ts
│   └── query-module-name.dto.ts
└── __tests__/                     # Unit tests
```

### 4.3. Upload Module Structure

```
upload/
├── upload.module.ts
├── upload.controller.ts            # POST /upload/images
├── upload.service.ts               # Main upload logic
├── storage/
│   ├── disk-storage.service.ts    # Disk storage implementation
│   └── image-processor.service.ts # Image processing với Sharp
├── dto/
│   └── upload-file.dto.ts
└── __tests__/
```

**Disk Storage Service Example:**
```typescript
@Injectable()
export class DiskStorageService {
  constructor(
    @Inject('UPLOAD_CONFIG') private config: UploadConfig,
    private imageProcessor: ImageProcessorService,
  ) {}

  async saveFile(file: Express.Multer.File, type: 'product' | 'banner' | 'category' | 'store'): Promise<UploadResult> {
    const filename = `${uuid()}-${file.originalname}`;
    const uploadPath = path.join(this.config.dest, type, 'original');
    
    // Ensure directory exists
    await fs.ensureDir(uploadPath);
    
    // Save original file
    const filePath = path.join(uploadPath, filename);
    await fs.writeFile(filePath, file.buffer);
    
    // Process images (resize, optimize)
    if (file.mimetype.startsWith('image/')) {
      await this.imageProcessor.processImage(filePath, type);
    }
    
    return {
      url: `${this.config.publicUrl}/${type}/original/${filename}`,
      filename,
      size: file.size,
    };
  }
}
```

---

## 5. DEPENDENCIES

### 5.1. Production Dependencies

```json
{
  "dependencies": {
    "@nestjs/common": "^11.0.0",
    "@nestjs/core": "^11.0.0",
    "@nestjs/platform-express": "^11.0.0",
    "@nestjs/config": "^3.3.0",
    "@nestjs/jwt": "^11.0.0",
    "@nestjs/passport": "^11.0.0",
    "@nestjs/swagger": "^8.0.0",
    "@nestjs/cache-manager": "^2.2.0",
    "@nestjs/throttler": "^6.0.0",
    "@nestjs/schedule": "^4.1.0",
    "@prisma/client": "^6.0.0",  // Nếu dùng Prisma
    "prisma": "^6.0.0",           // Nếu dùng Prisma
    // HOẶC
    "@mikro-orm/core": "^6.0.0",  // Nếu dùng MikroORM
    "@mikro-orm/postgresql": "^6.0.0",
    "@mikro-orm/nestjs": "^6.0.0",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "passport-local": "^1.0.0",
    "bcrypt": "^5.1.1",
    "class-validator": "^0.14.1",
    "class-transformer": "^0.5.1",
    "multer": "^1.4.5-lts.1",
    "sharp": "^0.33.0",
    "redis": "^4.7.0",
    "cache-manager": "^5.7.0",
    "cache-manager-redis-store": "^3.0.1",
    "reflect-metadata": "^0.2.2",
    "rxjs": "^7.8.1"
  }
}
```

### 5.2. Development Dependencies

```json
{
  "devDependencies": {
    "@nestjs/cli": "^11.0.0",
    "@nestjs/schematics": "^11.0.0",
    "@nestjs/testing": "^11.0.0",
    "@types/node": "^20.14.0",
    "@types/bcrypt": "^5.0.2",
    "@types/passport-jwt": "^4.0.1",
    "@types/passport-local": "^1.0.38",
    "@types/multer": "^1.4.12",
    "@types/jest": "^29.5.12",
    "@types/supertest": "^6.0.2",
    "typescript": "^5.6.0",
    "ts-node": "^10.9.2",
    "ts-loader": "^9.5.1",
    "tsconfig-paths": "^4.2.0",
    "jest": "^29.7.0",
    "supertest": "^7.0.0",
    "ts-jest": "^29.2.0",
    "eslint": "^9.0.0",
    "@typescript-eslint/parser": "^8.0.0",
    "@typescript-eslint/eslint-plugin": "^8.0.0",
    "prettier": "^3.3.0"
  }
}
```

---

## 6. ENVIRONMENT VARIABLES

```env
# Application
NODE_ENV=development
PORT=3001
API_PREFIX=api

# Node.js Version
# Required: >=20.0.0 (NestJS 11 requirement)

# Database (Prisma)
DATABASE_URL=postgresql://user:password@localhost:5432/ecommerce_minimart?schema=public

# Database (MikroORM)
DB_HOST=localhost
DB_PORT=5432
DB_USER=user
DB_PASSWORD=password
DB_NAME=ecommerce_minimart

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# File Upload (Disk Storage)
UPLOAD_DEST=./uploads
MAX_FILE_SIZE=5242880  # 5MB
UPLOAD_PUBLIC_URL=http://localhost:3001/uploads  # Public URL for uploaded files
ENABLE_IMAGE_OPTIMIZATION=true
IMAGE_QUALITY=85  # JPEG quality (1-100)
THUMBNAIL_SIZE=150
MEDIUM_SIZE=500
LARGE_SIZE=1200

# CORS
CORS_ORIGIN=http://localhost:3000

# Swagger
SWAGGER_ENABLED=true
```

---

## 7. DATABASE MIGRATION

### 7.1. Prisma Migration

```bash
# Tạo migration
npx prisma migrate dev --name init

# Apply migration
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate

# Open Prisma Studio
npx prisma studio
```

### 7.2. MikroORM Migration

```bash
# Tạo migration
npm run migration:create

# Run migration
npm run migration:up

# Rollback migration
npm run migration:down
```

---

## 8. API DOCUMENTATION

Swagger UI sẽ tự động generate từ decorators:
- URL: `http://localhost:3001/api/docs`
- Auto-generate từ DTOs và controllers
- Interactive API testing

---

## 9. TESTING STRATEGY

### 9.1. Unit Tests
- Test services, utilities
- Mock dependencies
- Coverage target: 80%+

### 9.2. Integration Tests
- Test API endpoints
- Test database operations
- Test authentication flows

### 9.3. E2E Tests
- Test complete user flows
- Test critical business logic

---

## 10. DEPLOYMENT

### 10.1. Docker

```dockerfile
# Dockerfile
# Node.js 20+ required for NestJS 11
FROM node:20-alpine AS base

# Dependencies stage
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build stage
FROM base AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate  # Nếu dùng Prisma
RUN npm run build

# Production stage
FROM base AS production
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma  # Nếu dùng Prisma
RUN npx prisma generate  # Nếu dùng Prisma
EXPOSE 3001
CMD ["node", "dist/main"]
```

### 10.2. Docker Compose

```yaml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/ecommerce_minimart
    depends_on:
      - db
      - redis
  
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: ecommerce_minimart
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
```

---

## 11. RECOMMENDATIONS

### 11.1. Prisma vs MikroORM

**Chọn Prisma nếu:**
- Muốn developer experience tốt nhất
- Cần type safety mạnh mẽ
- Muốn Prisma Studio để quản lý data
- Team mới với ORM

**Chọn MikroORM nếu:**
- Cần Unit of Work pattern
- Muốn Identity Map pattern
- Cần fine-grained control
- Team đã quen với TypeORM hoặc Hibernate

### 11.2. Best Practices

1. **Use DTOs** cho tất cả API inputs/outputs
2. **Validate** tất cả inputs với class-validator
3. **Use Guards** cho authentication/authorization
4. **Use Interceptors** cho logging, transformation
5. **Use Pipes** cho validation, transformation
6. **Use Exception Filters** cho error handling
7. **Use Modules** để organize code
8. **Use Services** cho business logic
9. **Use Repositories** (nếu cần) cho data access layer
10. **Write Tests** cho critical paths

---

## 12. FILE UPLOAD IMPLEMENTATION

### 12.1. Disk Storage Configuration

**Upload Service Setup:**
```typescript
// upload.module.ts
@Module({
  imports: [
    ConfigModule,
    MulterModule.register({
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = path.join(process.cwd(), 'uploads', file.fieldname);
          fs.ensureDirSync(uploadPath);
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueName = `${uuid()}-${Date.now()}${path.extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
      fileFilter: (req, file, cb) => {
        if (file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
          cb(null, true);
        } else {
          cb(new Error('Only image files are allowed'), false);
        }
      },
    }),
  ],
  controllers: [UploadController],
  providers: [UploadService, DiskStorageService, ImageProcessorService],
  exports: [UploadService],
})
export class UploadModule {}
```

### 12.2. Image Processing

**Auto-generate multiple sizes:**
- **Thumbnail**: 150x150 (for lists, grids)
- **Medium**: 500x500 (for product cards)
- **Large**: 1200x1200 (for product detail)
- **Original**: Keep original for backup

**Optimization:**
- Convert to WebP format (smaller file size)
- Compress JPEG quality to 85%
- Maintain aspect ratio
- Strip EXIF data

### 12.3. File Serving

**Static File Serving:**
```typescript
// main.ts
app.useStaticAssets(join(__dirname, '..', 'uploads'), {
  prefix: '/uploads',
});
```

**Public URLs:**
- Original: `http://localhost:3001/uploads/products/original/{filename}`
- Thumbnail: `http://localhost:3001/uploads/products/thumbnail/{filename}`
- Medium: `http://localhost:3001/uploads/products/medium/{filename}`
- Large: `http://localhost:3001/uploads/products/large/{filename}`

### 12.4. File Management

**Cleanup Strategy:**
- Delete old files khi update/delete entity
- Scheduled cleanup cho orphaned files
- Backup strategy cho production

---

## 13. PERFORMANCE OPTIMIZATION

1. **Database Indexing** - Index các columns thường query
2. **Caching** - Cache frequent queries với Redis
3. **Pagination** - Luôn paginate large datasets
4. **Lazy Loading** - Load relationships khi cần
5. **Connection Pooling** - Configure database connection pool
6. **Compression** - Enable gzip compression
7. **Rate Limiting** - Prevent abuse
8. **Image Optimization** - Auto-optimize uploaded images
9. **CDN Ready** - Structure cho phép migrate sang CDN sau này

---

## 13. VERSION COMPATIBILITY MATRIX

### 14.1. Core Versions (Verified Compatible)

| Package | Version | NestJS 11 Compatible | Notes |
|---------|---------|---------------------|-------|
| @nestjs/core | ^11.0.0 | ✅ | Latest stable |
| @nestjs/common | ^11.0.0 | ✅ | Latest stable |
| @nestjs/platform-express | ^11.0.0 | ✅ | Latest stable |
| @nestjs/config | ^3.3.0 | ✅ | Compatible |
| @nestjs/jwt | ^11.0.0 | ✅ | Latest stable |
| @nestjs/passport | ^11.0.0 | ✅ | Latest stable |
| @nestjs/swagger | ^8.0.0 | ✅ | Compatible với NestJS 11 |
| @nestjs/cache-manager | ^2.2.0 | ✅ | Compatible |
| @nestjs/throttler | ^6.0.0 | ✅ | Compatible với NestJS 11 |
| @nestjs/schedule | ^4.1.0 | ✅ | Compatible |
| TypeScript | ^5.6.0 | ✅ | Latest stable |
| Node.js | >=20.0.0 | ✅ | Required for NestJS 11 |

### 14.2. ORM Versions

| ORM | Version | NestJS 11 Compatible | Notes |
|-----|---------|---------------------|-------|
| Prisma | ^6.0.0 | ✅ | Latest stable, no official NestJS module needed |
| MikroORM | ^6.0.0 | ✅ | Official @mikro-orm/nestjs support |

### 14.3. Update Commands

```bash
# Update all NestJS packages to latest
npm update @nestjs/*

# Update to specific NestJS 11 version
npm install @nestjs/core@^11.0.0 @nestjs/common@^11.0.0 @nestjs/platform-express@^11.0.0

# Update Prisma
npm install @prisma/client@latest prisma@latest
npx prisma generate

# Update MikroORM
npm install @mikro-orm/core@latest @mikro-orm/nestjs@latest @mikro-orm/postgresql@latest

# Check for outdated packages
npm outdated
```

### 14.4. Breaking Changes từ NestJS 10 → 11

1. **Node.js Requirement**: Minimum Node.js 20.0.0
2. **TypeScript**: Recommended 5.6.0+
3. **RxJS**: Updated to 7.8.1+
4. **Cache Manager**: Updated API, check migration guide
5. **Throttler**: Updated to v6, check breaking changes

**Migration Guide**: https://docs.nestjs.com/migration-guide

---

**Ngày tạo:** 2025-01-27  
**Ngày cập nhật:** 2025-01-27  
**Phiên bản:** 2.0 (Updated for NestJS 11)

