# syntax=docker/dockerfile:1
# Многостадийная сборка Next.js (output: "standalone") под Timeweb Cloud Apps.
# Итоговый образ не содержит dev-зависимостей и полного node_modules.

# ── 1. deps: ставим зависимости отдельно, чтобы кэшировать слой ──
FROM node:22-alpine AS deps
# libc6-compat нужен sharp/next на alpine (glibc-совместимость)
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ── 2. builder: собираем приложение ──
FROM node:22-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ── 3. runner: минимальный образ только со standalone-выводом ──
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# непривилегированный пользователь
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# standalone тянет минимальный сервер + нужные node_modules
COPY --from=builder /app/.next/standalone ./
# статику и public standalone-сервер сам не копирует — доносим руками
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
CMD ["node", "server.js"]
