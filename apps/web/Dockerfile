# ---- Builder ----
FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare pnpm@10.26.2 --activate

WORKDIR /app

# Copy workspace manifests for layer caching
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json nx.json tsconfig.base.json tsconfig.json ./
COPY apps/web ./apps/web
COPY libs ./libs

RUN pnpm install --frozen-lockfile

RUN pnpm nx build web --configuration=production

# ---- Production ----
FROM nginx:alpine AS production

COPY --from=builder /app/dist/apps/web/browser /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
