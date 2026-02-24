FROM node:22-alpine AS base
RUN apk add --no-cache openssl
RUN npm i -g pnpm

WORKDIR /app
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/shared ./packages/shared
COPY apps/api/package.json ./apps/api/package.json

RUN pnpm install --frozen-lockfile

COPY apps/api ./apps/api
RUN pnpm --filter api exec prisma generate

EXPOSE 3001
# Накатить миграции и запустить сервер
CMD ["sh", "-c", "pnpm --filter api exec prisma migrate deploy && pnpm --filter api start"]
