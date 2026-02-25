import Fastify from "fastify";
import cors from "@fastify/cors";
import { config } from "./config/index.js";
import authPlugin from "./plugins/auth.js";
import profileRoutes from "./routes/profile.js";
import leaderboardRoutes from "./routes/leaderboard.js";
import nftRoutes from "./routes/nft.js";
import paymentsRoutes from "./routes/payments.js";
import webhookRoutes from "./routes/webhook.js";

const app = Fastify({ logger: true });

await app.register(cors, { origin: config.webAppUrl });
// webhook регистрируется ДО authPlugin чтобы /bot/webhook не был заблокирован
await app.register(webhookRoutes);
await app.register(authPlugin);

await app.register(profileRoutes, { prefix: "/api" });
await app.register(leaderboardRoutes, { prefix: "/api" });
await app.register(nftRoutes, { prefix: "/api" });
await app.register(paymentsRoutes, { prefix: "/api" });

app.get("/health", async () => ({ status: "ok" }));

const shutdown = async () => {
  await app.close();
  process.exit(0);
};
process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);

await app.listen({ port: config.port, host: "0.0.0.0" });
