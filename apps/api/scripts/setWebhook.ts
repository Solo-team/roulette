/**
 * Регистрирует webhook в Telegram.
 * Запуск: pnpm --filter api exec tsx scripts/setWebhook.ts
 *
 * Требует в .env:
 *   BOT_TOKEN=...
 *   WEBHOOK_URL=https://your-api.com/bot/webhook
 *   WEBHOOK_SECRET=any-random-string   (опционально, но рекомендуется)
 */

import "dotenv/config";

const BOT_TOKEN = process.env["BOT_TOKEN"];
const WEBHOOK_URL = process.env["WEBHOOK_URL"];
const WEBHOOK_SECRET = process.env["WEBHOOK_SECRET"];

if (!BOT_TOKEN) {
  console.error("❌  BOT_TOKEN не задан в .env");
  process.exit(1);
}
if (!WEBHOOK_URL) {
  console.error("❌  WEBHOOK_URL не задан в .env");
  process.exit(1);
}

const body: Record<string, unknown> = {
  url: WEBHOOK_URL,
  allowed_updates: ["message", "pre_checkout_query"],
  drop_pending_updates: true,
};

if (WEBHOOK_SECRET) {
  body["secret_token"] = WEBHOOK_SECRET;
}

const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

const json = await res.json() as { ok: boolean; description?: string };

if (json.ok) {
  console.log("✅  Webhook установлен:", WEBHOOK_URL);
} else {
  console.error("❌  Ошибка:", json.description);
  process.exit(1);
}
