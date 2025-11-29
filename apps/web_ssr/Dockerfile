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

# Production stage
FROM node:22-alpine AS production

WORKDIR /app

# Copy built app from builder
COPY --from=builder /app/apps/web_ssr/.next/standalone ./
COPY --from=builder /app/apps/web_ssr/.next/static ./apps/web_ssr/.next/static
COPY --from=builder /app/apps/web_ssr/public ./apps/web_ssr/public

WORKDIR /app/apps/web_ssr

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
