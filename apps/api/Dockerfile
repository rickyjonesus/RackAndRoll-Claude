# ---- Builder ----
FROM node:24-alpine AS builder

RUN corepack enable && corepack prepare pnpm@10.26.2 --activate

WORKDIR /app

# Copy workspace manifests for layer caching
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json tsconfig.base.json tsconfig.json ./
COPY apps/api ./apps/api
COPY libs ./libs

RUN pnpm install --frozen-lockfile

# Generate Prisma client for the target platform before bundling
RUN pnpm exec prisma generate --schema apps/api/prisma/schema.prisma

RUN pnpm run build:api

# ---- Production ----
FROM node:24-alpine AS production

WORKDIR /app

# Copy the webpack-bundled output (all node_modules bundled in; no npm install needed)
COPY --from=builder /app/dist/apps/api/main.js ./

# Copy Prisma schema so migrate deploy can run at startup
COPY --from=builder /app/apps/api/prisma ./prisma

# Copy the Prisma client generated for linux/alpine
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3000

CMD ["node", "main.js"]
