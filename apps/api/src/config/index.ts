import "dotenv/config";

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

const isProd = process.env["NODE_ENV"] === "production";

export const config = {
  port: Number(process.env["PORT"] ?? 3001),
  botToken: requireEnv("BOT_TOKEN"),
  botUsername: process.env["BOT_USERNAME"] ?? "",
  webhookSecret: process.env["WEBHOOK_SECRET"] ?? "",
  webhookUrl: process.env["WEBHOOK_URL"] ?? "",
  tonApiKey: process.env["TON_API_KEY"] ?? "",
  webAppUrl: process.env["WEB_APP_URL"] ?? "http://localhost:5173",
  donationWallet: process.env["DONATION_WALLET"] ?? "",
  domain: process.env["DOMAIN"] ?? "",
} as const;

// Fail fast: обязательные переменные в проде
if (isProd) {
  if (!config.webhookSecret) throw new Error("WEBHOOK_SECRET required in production");
  if (!config.donationWallet) throw new Error("DONATION_WALLET required in production");
}
