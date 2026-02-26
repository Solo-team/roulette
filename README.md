# Rolls — Telegram Mini App

Монорепо (pnpm workspaces) с двумя приложениями:

| Пакет | Описание |
|-------|----------|
| `apps/api` | Fastify API + Prisma + PostgreSQL |
| `apps/web` | React + Vite (Telegram Mini App) |
| `packages/shared` | Общие TypeScript-типы |

---

## Требования

- **Node.js** 22+
- **pnpm** 9+ (`npm i -g pnpm`)
- **Docker** + Docker Compose (для базы данных)
- **ngrok** или любой публичный туннель (для вебхука бота в dev-режиме)

---

## Быстрый старт (локально)

### 1. Установить зависимости

```bash
cd roulette-app
pnpm install
```

### 2. Настроить переменные окружения

```bash
cp apps/api/.env.example apps/api/.env
```

Открыть `apps/api/.env` и заполнить:

```env
DATABASE_URL=postgresql://roulette:roulette@localhost:5432/roulette
BOT_TOKEN=<токен от @BotFather>
BOT_USERNAME=<username бота без @>
WEBHOOK_URL=https://<твой-туннель>.ngrok-free.app/bot/webhook
WEBHOOK_SECRET=любая-случайная-строка
WEB_APP_URL=http://localhost:5173
PORT=3001
NODE_ENV=development
```

> `TON_API_KEY` — опционально. Без него работает с более низкими лимитами.

### 3. Поднять базу данных

```bash
docker compose up -d postgres
```

### 4. Накатить миграции

```bash
pnpm --filter api db:migrate
```

Опционально — заполнить таблицу `BotUser` тестовыми данными для лидерборда:

```bash
pnpm --filter api db:seed
```

### 5. Запустить API и фронтенд

```bash
# Оба сервиса одновременно
pnpm dev

# Или по отдельности
pnpm dev:api   # http://localhost:3001
pnpm dev:web   # http://localhost:5173
```

### 6. Зарегистрировать вебхук бота

Запустить ngrok (или другой туннель) для порта 3001 и прописать URL в `.env`:

```bash
ngrok http 3001
# → скопировать https://xxxx.ngrok-free.app в WEBHOOK_URL в .env
```

Затем зарегистрировать вебхук:

```bash
pnpm --filter api bot:set-webhook
```

Проверить: открыть бота в Telegram и написать `/start`.

---

## Структура проекта

```
roulette-app/
├── apps/
│   ├── api/
│   │   ├── prisma/
│   │   │   ├── schema.prisma      # Схема БД
│   │   │   ├── migrations/        # SQL-миграции
│   │   │   └── seed.ts            # Тестовые данные
│   │   ├── scripts/
│   │   │   └── setWebhook.ts      # Регистрация вебхука
│   │   └── src/
│   │       ├── config/            # Переменные окружения
│   │       ├── plugins/auth.ts    # Telegram initData авторизация
│   │       ├── routes/            # Fastify маршруты
│   │       └── services/          # Бизнес-логика
│   └── web/
│       └── src/
│           ├── api/client.ts      # HTTP-клиент + DEV-моки
│           ├── components/        # UI-компоненты
│           ├── hooks/             # React-хуки
│           ├── pages/             # Страницы приложения
│           └── store/             # Zustand store
└── packages/
    └── shared/src/types.ts        # Общие типы (API / фронтенд)
```

---

## API-маршруты

| Метод | URL | Описание |
|-------|-----|----------|
| `GET` | `/api/profile` | Профиль текущего пользователя |
| `PATCH` | `/api/profile/wallet` | Привязать TON-кошелёк |
| `GET` | `/api/referrals` | Реферальная статистика + ссылка |
| `GET` | `/api/tasks` | Список заданий с прогрессом |
| `POST` | `/api/tasks/:id/claim` | Забрать награду за задание |
| `GET` | `/api/leaderboard` | Топ-100 игроков |
| `POST` | `/api/nft/claim` | Забрать ежедневный клейм |
| `GET` | `/api/nft` | NFT пользователя |
| `POST` | `/api/payments/stars-invoice` | Создать инвойс (Telegram Stars) |
| `POST` | `/api/payments/ton-donate` | Подтвердить TON-платёж |
| `POST` | `/bot/webhook` | Вебхук Telegram-бота |

Авторизация: заголовок `x-init-data` с `initData` из Telegram WebApp.
В `NODE_ENV=development` авторизация не требуется.

---

## Полезные команды

```bash
# Открыть Prisma Studio (визуальный редактор БД)
pnpm --filter api db:studio

# Создать новую миграцию после изменения schema.prisma
pnpm --filter api db:migrate

# Удалить вебхук бота
pnpm --filter api bot:del-webhook

# Проверка типов (оба пакета)
pnpm typecheck
```

---

## Деплой через Docker

Docker Compose поднимает два контейнера: **PostgreSQL** + **API**.
Фронтенд деплоится отдельно на Vercel (статика).

### 1. Настроить переменные окружения

В корне проекта (рядом с `docker-compose.yml`):

```bash
cp .env.example .env
```

Открыть `.env` и заполнить:

```env
BOT_TOKEN=<токен от @BotFather>
BOT_USERNAME=<username бота без @>
WEBHOOK_URL=https://<твой-домен>/bot/webhook
WEBHOOK_SECRET=любая-случайная-строка
TON_API_KEY=                               # опционально
WEB_APP_URL=https://<твой-vercel-url>
```

> `DATABASE_URL` задавать не нужно — docker-compose подставляет его автоматически.

### 2. Собрать и запустить

```bash
docker compose up -d --build
```

Что произойдёт внутри:
1. Поднимется контейнер `postgres` и дождётся healthcheck-а
2. Соберётся образ `api` (Node 22 Alpine)
3. При старте контейнера автоматически накатятся все миграции (`prisma migrate deploy`)
4. Запустится Fastify на порту `3001`

Проверить, что всё работает:

```bash
curl http://localhost:3001/health
# → {"status":"ok"}

docker compose logs -f api   # логи в реальном времени
```

### 3. Зарегистрировать вебхук бота

Нужен публичный URL API (домен / ngrok-туннель → порт 3001).
Когда `WEBHOOK_URL` прописан в `.env`:

```bash
# Запустить один раз — Telegram начнёт слать обновления
pnpm --filter api bot:set-webhook
```

### 4. Задеплоить фронтенд на Vercel

```bash
# Разовая сборка
pnpm install
pnpm build
# dist лежит в apps/web/dist
```

Или автодеплой через Vercel GitHub integration:

| Настройка | Значение |
|-----------|----------|
| Root Directory | `roulette-app` |
| Build Command | `pnpm build` |
| Output Directory | `apps/web/dist` |
| Env Variable | `VITE_API_URL=https://твой-api-домен.com` |

После деплоя фронтенда обновить `WEB_APP_URL` в корневом `.env` и переставить вебхук:

```bash
docker compose up -d   # перезапустит api с новым WEB_APP_URL
pnpm --filter api bot:set-webhook
```

### Управление контейнерами

```bash
docker compose ps                    # статус контейнеров
docker compose logs -f               # все логи
docker compose logs -f api           # только API
docker compose restart api           # перезапустить API
docker compose down                  # остановить всё
docker compose down -v               # остановить + удалить данные БД (!)
```

---

## Деплой локально (без Docker)

### API — напрямую

```bash
# Сначала поднять только postgres
docker compose up -d postgres

# Затем запустить API локально
pnpm install
pnpm --filter api db:migrate
pnpm dev:api   # http://localhost:3001
```

### Фронтенд — Vercel

```bash
pnpm dev:web   # http://localhost:5173
```
