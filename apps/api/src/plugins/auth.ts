import type { FastifyPluginAsync, FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import { createHmac } from "crypto";
import { config } from "../config/index.js";
import { prisma } from "../lib/prisma.js";

interface TgUser {
  id: number;
  first_name: string;
  username?: string;
  photo_url?: string;
}

declare module "fastify" {
  interface FastifyRequest {
    tgUser: TgUser;
  }
}

function verifyInitData(raw: string): TgUser {
  const params = new URLSearchParams(raw);
  const hash = params.get("hash");
  if (!hash) throw new Error("No hash");

  params.delete("hash");
  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");

  const secretKey = createHmac("sha256", "WebAppData")
    .update(config.botToken)
    .digest();

  const expectedHash = createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  if (expectedHash !== hash) throw new Error("Invalid signature");

  const userJson = params.get("user");
  if (!userJson) throw new Error("No user in initData");
  return JSON.parse(userJson) as TgUser;
}

const authPlugin: FastifyPluginAsync = async (app) => {
  app.addHook("preHandler", async (request: FastifyRequest, reply) => {
    // Пропускаем health-check и bot webhook (у них своя авторизация)
    if (request.url === "/health" || request.url.startsWith("/bot/webhook")) return;

    const raw = request.headers["x-init-data"] as string | undefined;

    // В dev-режиме разрешаем запросы без заголовка
    if (!raw && process.env["NODE_ENV"] === "development") {
      request.tgUser = { id: 1, first_name: "Dev", username: "dev" };
      return;
    }

    if (!raw) {
      return reply.code(401).send({ error: "Unauthorized", message: "Missing x-init-data" });
    }

    try {
      const tgUser = verifyInitData(raw);
      request.tgUser = tgUser;

      // Upsert пользователя при каждом запросе
      await prisma.user.upsert({
        where: { id: BigInt(tgUser.id) },
        create: {
          id: BigInt(tgUser.id),
          firstName: tgUser.first_name,
          username: tgUser.username ?? null,
          photoUrl: tgUser.photo_url ?? null,
        },
        update: {
          firstName: tgUser.first_name,
          username: tgUser.username ?? null,
          photoUrl: tgUser.photo_url ?? null,
        },
      });
    } catch {
      return reply.code(401).send({ error: "Unauthorized", message: "Invalid initData" });
    }
  });
};

export default fp(authPlugin);
