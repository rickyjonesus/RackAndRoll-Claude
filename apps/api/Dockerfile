# ---- Builder ----
FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare pnpm@10.26.2 --activate

WORKDIR /app

# Copy workspace manifests for layer caching
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json nx.json tsconfig.base.json tsconfig.json ./
COPY apps/api ./apps/api
COPY libs ./libs

RUN pnpm install --frozen-lockfile

# Generate Prisma client for the target platform before bundling
RUN pnpm exec prisma generate --schema apps/api/prisma/schema.prisma

RUN pnpm nx build api

# ---- Production ----
FROM node:22-alpine AS production

WORKDIR /app

# Copy the webpack-bundled output and its pruned package.json
COPY --from=builder /app/dist/apps/api/main.js ./
COPY --from=builder /app/dist/apps/api/package.json ./

# Copy Prisma schema so migrate deploy can run at startup
COPY --from=builder /app/apps/api/prisma ./prisma

# Install only the production deps declared in the pruned package.json
# --ignore-scripts skips @prisma/client postinstall (prisma CLI not present)
RUN npm install --omit=dev --ignore-scripts

# Copy the client generated for linux/alpine from the builder
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3000

CMD ["node", "main.js"]
