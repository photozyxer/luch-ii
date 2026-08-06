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
# HOSTNAME форсируем прямо в команде запуска, а не через ENV: платформы вроде
# Timeweb инжектят в контейнер свой HOSTNAME (= ID контейнера), он перебивает
# ENV, и Next слушает служебный адрес → healthcheck не проходит.
# Слушаем на "::" (IPv6-wildcard, dual-stack): на Linux это принимает и IPv6, и
# IPv4-соединения. "0.0.0.0" принимает только IPv4 — если healthcheck/прокси
# Timeweb стучится по IPv6, проверка не проходит, хотя приложение живо.
# exec заменяет sh на node → node становится PID 1 и корректно ловит сигналы.
CMD ["sh", "-c", "exec env HOSTNAME=:: node server.js"]
