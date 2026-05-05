# ── Stage 1: Build ──────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@10

# Copy dependency files first (layer cache)
COPY package.json pnpm-lock.yaml ./

# Install all dependencies (including devDependencies needed for build)
RUN pnpm install --frozen-lockfile

# Copy source
COPY . .

# Build: Vite (client) + esbuild (server)
RUN pnpm run build

# ── Stage 2: Production image ────────────────────────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /app

# Install pnpm (needed to install production deps only)
RUN npm install -g pnpm@10

# Copy dependency files
COPY package.json pnpm-lock.yaml ./

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built artifacts from builder stage
COPY --from=builder /app/dist ./dist

# Copy drizzle config for potential migrations
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts

# Non-root user for security
RUN addgroup -S diplamus && adduser -S diplamus -G diplamus
USER diplamus

EXPOSE 3001

ENV NODE_ENV=production
ENV PORT=3001

CMD ["node", "dist/index.js"]
