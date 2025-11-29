# SSR Migration Plan - Chuyển từ Client-side sang Server-side

## Tổng quan

Hiện tại app đang dùng **Vite + React Router** (SPA) trong `apps/web/`. 
Để tối ưu SEO, sẽ tạo **Next.js SSR app mới** trong `apps/web_ssr/` để tránh conflict với code hiện tại.

## Lợi ích của SSR với Next.js

1. **SEO tốt hơn**: HTML được render trên server, search engines có thể crawl ngay
2. **Performance**: Initial load nhanh hơn, content hiển thị ngay
3. **Meta tags**: Title, description được inject vào HTML từ server
4. **Social sharing**: Open Graph tags hoạt động tốt hơn
5. **Settings từ API**: Có thể fetch settings trên server trước khi render

## Migration Strategy

### Tạo app mới: `apps/web_ssr/`

**Ưu điểm:**
- Không conflict với code hiện tại
- Có thể test song song
- Dễ rollback nếu cần
- Có thể migrate từng phần

**Cấu trúc mới:**
```
apps/
├── web/                     # Client-side app hiện tại (giữ nguyên)
│   └── ...
└── web_ssr/                # Next.js SSR app mới
    ├── app/                 # Next.js App Router
    │   ├── layout.tsx       # Root layout
    │   ├── page.tsx         # Home page (/)
    │   ├── products/
    │   │   ├── page.tsx     # Products list (/products)
    │   │   └── [slug]/
    │   │       └── page.tsx # Product detail (/products/:slug)
    │   ├── cart/
    │   │   └── page.tsx     # Cart page
    │   └── ...
    ├── components/          # Shared components (copy từ web/)
    ├── lib/                 # Utilities (copy từ web/)
    ├── public/              # Static files
    ├── package.json
    ├── next.config.js
    └── tsconfig.json
```

### Option 2: Vite SSR (Giữ Vite)

**Ưu điểm:**
- Giữ được cấu trúc hiện tại
- Không cần migrate nhiều code

**Nhược điểm:**
- Phải tự setup SSR
- Ít tooling hơn Next.js
- Phức tạp hơn để maintain

## Next.js Migration Steps

### Step 1: Tạo folder mới và setup Next.js

```bash
# Tạo folder mới
mkdir -p apps/web_ssr

# Copy package.json từ web và update
cd apps/web_ssr
npm init -y

# Install Next.js và dependencies
npm install next@latest react@latest react-dom@latest
npm install -D @types/node @types/react @types/react-dom typescript

# Copy shared dependencies từ web
# (sẽ copy từ apps/web/package.json)
```

### Step 2: Copy và adapt code từ `apps/web/`

**Copy structure:**
```bash
# Copy components (có thể dùng symlink hoặc copy)
cp -r ../web/src/components apps/web_ssr/
cp -r ../web/src/lib apps/web_ssr/
cp -r ../web/src/types apps/web_ssr/
cp -r ../web/src/i18n apps/web_ssr/
cp -r ../web/src/services apps/web_ssr/
cp -r ../web/src/context apps/web_ssr/
cp -r ../web/src/styles apps/web_ssr/
cp -r ../web/public apps/web_ssr/
```

**Update imports:**
- Remove `@/` alias nếu không dùng
- Update relative paths nếu cần

### Step 3: Create Next.js structure

**Create `apps/web_ssr/app/layout.tsx`:**
```tsx
import { SettingsProvider } from '../context/SettingsContext'
import { CartProvider } from '../context/CartContext'
import { RecentlyViewedProvider } from '../context/RecentlyViewedContext'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'
import { Toaster } from '../components/ui/sonner'
import '../styles/globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <SettingsProvider>
          <CartProvider>
            <RecentlyViewedProvider>
              <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
                <Toaster position="top-right" />
              </div>
            </RecentlyViewedProvider>
          </CartProvider>
        </SettingsProvider>
      </body>
    </html>
  )
}
```

**Create `apps/web_ssr/app/page.tsx` (Home):**
```tsx
import { HomePage as HomePageComponent } from '../components/HomePage'
import { settingsService } from '../services/settings.service'

export async function generateMetadata() {
  const settings = await settingsService.getAll().catch(() => ({}))
  return {
    title: settings.store_name || 'Minimart',
    description: settings.store_description || '',
  }
}

export default async function HomePage() {
  return <HomePageComponent />
}
```

### Step 4: Migrate Pages sang App Router

**Before (React Router):**
```tsx
// apps/web/src/pages/HomePage.tsx
export default function HomePage() {
  return <div>Home</div>
}
```

**After (Next.js App Router):**
```tsx
// apps/web_ssr/app/page.tsx
export default function HomePage() {
  return <div>Home</div>
}
```

**Routing mapping:**
- `/` → `app/page.tsx`
- `/products` → `app/products/page.tsx`
- `/products/:slug` → `app/products/[slug]/page.tsx`
- `/cart` → `app/cart/page.tsx`
- `/contact` → `app/contact/page.tsx`
- `/stores` → `app/stores/page.tsx`
- `/order-tracking` → `app/order-tracking/page.tsx`

### Step 5: Server-side Data Fetching

**Before (Client-side):**
```tsx
// apps/web/src/pages/HomePage.tsx
useEffect(() => {
  fetch('/api/settings').then(...)
}, [])
```

**After (Server-side):**
```tsx
// apps/web_ssr/app/page.tsx
import { settingsService } from '../services/settings.service'

export default async function HomePage() {
  const settings = await settingsService.getAll()
  return <div>{settings.store_name}</div>
}
```

### Step 6: Update Metadata

**Before (react-helmet-async):**
```tsx
// apps/web/src/pages/HomePage.tsx
<Helmet>
  <title>Home</title>
</Helmet>
```

**After (Next.js Metadata API):**
```tsx
// apps/web_ssr/app/page.tsx
export async function generateMetadata() {
  const settings = await settingsService.getAll()
  return {
    title: settings.store_name,
    description: settings.store_description,
  }
}
```

### Step 7: Create Next.js config

**Create `apps/web_ssr/next.config.js`:**
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
  env: {
    VITE_API_URL: process.env.VITE_API_URL,
  },
  // Output standalone for Docker
  output: 'standalone',
}

module.exports = nextConfig
```

### Step 8: Update package.json

**Create `apps/web_ssr/package.json`:**
```json
{
  "name": "@ecommerce/web-ssr",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "start": "next start -p 3000",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    // ... copy từ apps/web/package.json
  }
}
```

### Step 9: Create Dockerfile cho Next.js

**Create `apps/web_ssr/Dockerfile`:**
```dockerfile
# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
COPY apps/web_ssr ./apps/web_ssr

# Install dependencies
RUN npm ci

# Build Next.js app
WORKDIR /app/apps/web_ssr
ENV NODE_ENV=production
RUN npm run build

# Production stage
FROM node:22-alpine AS production

WORKDIR /app

# Copy built app
COPY --from=builder /app/apps/web_ssr/.next/standalone ./
COPY --from=builder /app/apps/web_ssr/.next/static ./apps/web_ssr/.next/static
COPY --from=builder /app/apps/web_ssr/public ./apps/web_ssr/public

WORKDIR /app/apps/web_ssr

EXPOSE 3000

CMD ["node", "server.js"]
```

## Migration Checklist

- [ ] Tạo folder `apps/web_ssr/`
- [ ] Setup Next.js project
- [ ] Copy components, lib, types, services từ `apps/web/`
- [ ] Create `app/` directory structure
- [ ] Migrate `pages/` → `app/` routes
- [ ] Convert client-side data fetching → server-side
- [ ] Update metadata (Helmet → Next.js Metadata API)
- [ ] Update routing (React Router → Next.js routing)
- [ ] Update links (`Link` from react-router → Next.js `Link`)
- [ ] Update contexts để hoạt động với SSR
- [ ] Test all pages
- [ ] Create Dockerfile for Next.js
- [ ] Update docker-compose.prod.yml để include web_ssr
- [ ] Update nginx config để route đến web_ssr

## File Structure Comparison

**Current (Client-side):**
```
apps/web/
├── src/
│   ├── pages/          # React Router pages
│   ├── components/     # Components
│   ├── routes/         # Route config
│   └── ...
└── public/
```

**New (SSR):**
```
apps/web_ssr/
├── app/                # Next.js App Router
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Home (/)
│   ├── products/       # Products routes
│   └── ...
├── components/         # Shared components (copy từ web)
├── lib/                # Utilities (copy từ web)
├── services/           # API services (copy từ web)
└── public/             # Static files
```

## Estimated Time

- Setup structure: 1 day
- Migrate pages: 2-3 days
- Update components for SSR: 1-2 days
- Testing & fixes: 1-2 days
- **Total: 5-8 days**

## Deployment Strategy

**Option 1: Replace gradually**
1. Deploy `web_ssr` song song với `web`
2. Test kỹ `web_ssr`
3. Switch nginx routing từ `web` → `web_ssr`
4. Giữ `web` làm backup

**Option 2: Feature flag**
- Dùng feature flag để switch giữa `web` và `web_ssr`
- Dễ rollback nếu có issue

## Next Steps

Nếu muốn bắt đầu migration, tôi có thể:
1. ✅ Tạo folder `apps/web_ssr/` và setup Next.js
2. ✅ Copy và adapt code từ `apps/web/`
3. ✅ Migrate từng page một
4. ✅ Update Dockerfile và docker-compose
5. ✅ Setup deployment config

