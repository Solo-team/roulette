import Fastify, { type FastifyRequest } from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import { config } from "./config/index.js";
import authPlugin from "./plugins/auth.js";
import profileRoutes from "./routes/profile.js";
import leaderboardRoutes from "./routes/leaderboard.js";
import nftRoutes from "./routes/nft.js";
import paymentsRoutes from "./routes/payments.js";
import referralRoutes from "./routes/referrals.js";
import taskRoutes from "./routes/tasks.js";
import webhookRoutes from "./routes/webhook.js";
import shopRoutes from "./routes/shop.js";

const isProd = process.env["NODE_ENV"] === "production";

const app = Fastify({
  logger: isProd
    ? { level: "info" }
    : { level: "debug", transport: { target: "pino-pretty" } },
  requestIdLogLabel: "reqId",
  genReqId: () => crypto.randomUUID(),
});

// ── Global unhandled error handlers ──────────────────────────────────────────
process.on("unhandledRejection", (reason) => {
  app.log.error({ reason }, "Unhandled promise rejection");
});
process.on("uncaughtException", (err) => {
  app.log.error({ err }, "Uncaught exception — shutting down");
  process.exit(1);
});

// ── Rate limiting ─────────────────────────────────────────────────────────────
// Глобально: 100 запросов в минуту на пользователя/IP.
// Эндпоинты платежей задают свой лимит через route config: { rateLimit: { max: 10 } }.
await app.register(rateLimit, {
  global: true,
  max: 100,
  timeWindow: "1 minute",
  keyGenerator: (req: FastifyRequest) => {
    const tgUser = (req as unknown as { tgUser?: { id?: number } }).tgUser;
    return tgUser?.id ? String(tgUser.id) : req.ip;
  },
  allowList: (req: FastifyRequest) =>
    req.url === "/health" || req.url.startsWith("/bot/webhook"),
  errorResponseBuilder: () => ({
    error: "TooManyRequests",
    message: "Rate limit exceeded, try again later",
  }),
});

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = [config.webAppUrl, "http://localhost:5173", "http://localhost:4173"];
await app.register(cors, {
  origin: (origin, cb) => cb(null, !origin || allowedOrigins.includes(origin)),
});

// ── Routes ────────────────────────────────────────────────────────────────────
// webhook регистрируется ДО authPlugin, чтобы /bot/webhook не требовал initData
await app.register(webhookRoutes);
await app.register(authPlugin);

await app.register(profileRoutes,     { prefix: "/api" });
await app.register(leaderboardRoutes, { prefix: "/api" });
await app.register(nftRoutes,         { prefix: "/api" });
await app.register(paymentsRoutes,    { prefix: "/api" });
await app.register(referralRoutes,    { prefix: "/api" });
await app.register(taskRoutes,        { prefix: "/api" });
await app.register(shopRoutes,        { prefix: "/api" });

app.get("/health", async () => ({ status: "ok" }));

// ── Graceful shutdown ─────────────────────────────────────────────────────────
const shutdown = async () => {
  app.log.info("Shutting down...");
  await app.close();
  process.exit(0);
};
process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);

await app.listen({ port: config.port, host: "0.0.0.0" });
