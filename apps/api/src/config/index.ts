import "dotenv/config";

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

export const config = {
  port: Number(process.env["PORT"] ?? 3001),
  botToken: requireEnv("BOT_TOKEN"),
  webhookSecret: process.env["WEBHOOK_SECRET"] ?? "",
  webhookUrl: process.env["WEBHOOK_URL"] ?? "",   // https://your-api.com/bot/webhook
  tonApiKey: process.env["TON_API_KEY"] ?? "",
  webAppUrl: process.env["WEB_APP_URL"] ?? "http://localhost:5173",
} as const;
