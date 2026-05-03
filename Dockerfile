# DiPlaMus Archive Frontend
# Multi-stage build: build → production

# ── Stage 1: Build ──
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10 --activate

# Install dependencies (cached layer)
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy source & build
COPY . .
RUN pnpm run build

# ── Stage 2: Production ──
FROM node:20-alpine AS production

WORKDIR /app

# Install pnpm for production deps only
RUN corepack enable && corepack prepare pnpm@10 --activate

# Copy package files and install production deps only
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

# Copy built output
COPY --from=builder /app/dist ./dist

# Copy static assets (logos, hero image)
COPY --from=builder /app/client/public/assets ./dist/public/assets

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["node", "dist/index.js"]
