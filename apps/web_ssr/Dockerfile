# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY turbo.json ./
COPY apps/web_ssr/package*.json ./apps/web_ssr/

# Copy packages (for shared dependencies if any)
COPY packages ./packages

# Install dependencies
RUN npm ci --workspace=@ecommerce/web-ssr

# Copy source code
COPY apps/web_ssr ./apps/web_ssr

# Build Next.js app
WORKDIR /app/apps/web_ssr
ENV NODE_ENV=production
RUN npm run build

# Copy public and static folders to standalone output as per Next.js docs
# https://nextjs.org/docs/pages/api-reference/config/next-config-js/output
# Standalone structure: .next/standalone/apps/web_ssr/
RUN cp -r public .next/standalone/apps/web_ssr/ 2>/dev/null || mkdir -p .next/standalone/apps/web_ssr/public
RUN cp -r .next/static .next/standalone/apps/web_ssr/.next/ 2>/dev/null || true

# Production stage
FROM node:22-alpine AS production

WORKDIR /app

# Copy built app from builder (standalone includes public and static already)
# According to Next.js docs, standalone output should have public and .next/static copied
COPY --from=builder /app/apps/web_ssr/.next/standalone ./

WORKDIR /app/apps/web_ssr

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
