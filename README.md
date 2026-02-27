# Rolls — Telegram Mini App

Монорепо (pnpm workspaces):

| Пакет | Описание |
|-------|----------|
| `apps/api` | Fastify API + Prisma + PostgreSQL |
| `apps/web` | React + Vite (Telegram Mini App) |
| `packages/shared` | Общие TypeScript-типы |

---

## Требования

- **Node.js** 22+
- **pnpm** 9+ (`npm i -g pnpm`)
- **Docker** + Docker Compose
- **ngrok** (или любой туннель) для локальной разработки

---

## Разработка локально (без Docker для API)

Самый простой вариант: база в Docker, API и фронтенд — нативно.

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
WEBHOOK_SECRET=<любая-случайная-строка>
WEB_APP_URL=http://localhost:5173
PORT=3001
NODE_ENV=development
```

Опциональные переменные:

```env
TON_API_KEY=          # без ключа tonapi.io работает с пониженными лимитами
DONATION_WALLET=EQ... # TON-адрес для верификации донатов
```

### 3. Поднять PostgreSQL

```bash
docker compose up -d postgres
```

### 4. Накатить миграции

```bash
pnpm --filter api db:migrate
```

Опционально — тестовые данные для лидерборда:

```bash
pnpm --filter api db:seed
```

### 5. Запустить API и фронтенд

```bash
pnpm dev          # API на :3001, фронтенд на :5173
```

### 6. Зарегистрировать вебхук

```bash
# В отдельном терминале — туннель к API
ngrok http 3001
# → скопировать https://xxxx.ngrok-free.app в WEBHOOK_URL в apps/api/.env
```

Зарегистрировать вебхук у Telegram:

```bash
pnpm --filter api bot:set-webhook
```

Проверка: открыть бота и написать `/start`.

---

## Docker Compose (полный стек)

Поднимает **PostgreSQL + API + Caddy** (реверс-прокси).
Caddy слушает на порту `80` (HTTP) — ngrok туннелирует порт `80`.
Если задан `DOMAIN` — Caddy автоматически получает TLS-сертификат Let's Encrypt.

### 1. Настроить переменные окружения

```bash
cp .env.example .env
```

Открыть `.env` и заполнить:

```env
BOT_TOKEN=<токен от @BotFather>
BOT_USERNAME=<username бота без @>
WEBHOOK_URL=https://<твой-туннель>.ngrok-free.app/bot/webhook
WEBHOOK_SECRET=<любая-случайная-строка>
WEB_APP_URL=https://<твой-vercel-url>
TON_API_KEY=              # опционально
DONATION_WALLET=EQ...     # опционально в dev, обязательно в prod
DOMAIN=                   # оставить пустым для dev с ngrok
```

> `DATABASE_URL` не нужен — docker-compose задаёт его автоматически.

### 2. Собрать и запустить

```bash
docker compose up -d --build
```

При старте API автоматически выполняет `prisma migrate deploy`.

### 3. Туннель и вебхук

```bash
# Туннелируем Caddy (порт 80, не 3001!)
ngrok http 80
# → скопировать https://xxxx.ngrok-free.app в WEBHOOK_URL в .env
```

Перезапустить API с новым URL и зарегистрировать вебхук:

```bash
docker compose up -d api
pnpm --filter api bot:set-webhook
```

### 4. Проверить работу

```bash
curl http://localhost/health
# → {"status":"ok"}

docker compose logs -f api
```

---

## Продакшн (с реальным доменом)

Отличается от dev только настройками `.env`. Caddy сам получит TLS-сертификат.

```env
BOT_TOKEN=...
BOT_USERNAME=...
WEBHOOK_URL=https://api.yourdomain.com/bot/webhook
WEBHOOK_SECRET=<сильный-секрет>
WEB_APP_URL=https://your-app.vercel.app
TON_API_KEY=<ключ от tonapi.io>
DONATION_WALLET=EQ...    # обязательно — TON-адрес для верификации платежей
DOMAIN=api.yourdomain.com
```

```bash
docker compose up -d --build
pnpm --filter api bot:set-webhook
```

> Порты 80 и 443 должны быть открыты на сервере. Caddy автоматически получит сертификат через Let's Encrypt.

---

## Фронтенд — деплой на Vercel

Настройки проекта в Vercel:

| Параметр | Значение |
|----------|----------|
| Root Directory | `roulette-app` |
| Build Command | `pnpm build` |
| Output Directory | `apps/web/dist` |
| Env Variable | `VITE_API_URL=https://api.yourdomain.com` |

После деплоя обновить `WEB_APP_URL` в `.env` и перезапустить API:

```bash
docker compose up -d api
```

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
│   │       ├── config/            # Переменные окружения + валидация
│   │       ├── plugins/auth.ts    # Telegram initData авторизация
│   │       ├── routes/            # Fastify маршруты
│   │       └── services/          # Бизнес-логика
│   └── web/
│       └── src/
│           ├── api/client.ts      # HTTP-клиент
│           ├── components/        # UI-компоненты + ErrorBoundary
│           ├── hooks/             # React-хуки
│           ├── pages/             # Страницы приложения
│           └── store/             # Zustand store
├── packages/
│   └── shared/src/types.ts        # Общие типы (API / фронтенд)
├── Caddyfile                      # Реверс-прокси конфиг
├── docker-compose.yml
└── .env.example
```

---

## API-маршруты

Авторизация: заголовок `x-init-data` с `initData` из Telegram WebApp.
В `NODE_ENV=development` авторизация не требуется.

| Метод | URL | Описание |
|-------|-----|----------|
| `GET` | `/health` | Проверка работоспособности |
| `GET` | `/api/profile` | Профиль текущего пользователя |
| `PATCH` | `/api/profile/wallet` | Привязать TON-кошелёк |
| `GET` | `/api/leaderboard` | Топ-100 игроков |
| `GET` | `/api/referrals` | Реферальная статистика + ссылка |
| `GET` | `/api/tasks` | Список заданий с прогрессом |
| `POST` | `/api/tasks/:id/claim` | Забрать награду за задание |
| `GET` | `/api/nft` | NFT пользователя |
| `POST` | `/api/nft/claim` | Ежедневный NFT-клейм |
| `POST` | `/api/payments/stars-invoice` | Создать инвойс (Telegram Stars) |
| `POST` | `/api/payments/ton-donate` | Подтвердить TON-платёж |
| `GET` | `/api/shop/gifts` | Каталог подарков (Telegram Bot API) |
| `GET` | `/api/shop/unique-gifts` | Уникальные NFT-подарки с Getgems (вторичный рынок) |
| `POST` | `/bot/webhook` | Вебхук Telegram-бота |

Параметры `/api/shop/unique-gifts`: `limit` (макс 200, по умолчанию 100), `offset`, `collection`.

---

## Полезные команды

```bash
# Запуск
pnpm dev                          # API + фронтенд одновременно
pnpm dev:api                      # только API (http://localhost:3001)
pnpm dev:web                      # только фронтенд (http://localhost:5173)

# База данных
pnpm --filter api db:migrate      # применить миграции
pnpm --filter api db:seed         # тестовые данные
pnpm --filter api db:studio       # Prisma Studio (визуальный редактор)

# Бот
pnpm --filter api bot:set-webhook  # зарегистрировать вебхук
pnpm --filter api bot:del-webhook  # удалить вебхук

# Качество кода
pnpm typecheck                    # проверка TypeScript (все пакеты)

# Docker
docker compose up -d --build      # поднять всё
docker compose logs -f api        # логи API
docker compose restart api        # перезапустить API
docker compose down               # остановить
docker compose down -v            # остановить + удалить данные БД (!)
```
