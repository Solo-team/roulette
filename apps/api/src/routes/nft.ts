import type { FastifyPluginAsync } from "fastify";
import { NftService } from "../services/NftService.js";
import { prisma } from "../lib/prisma.js";
import type { GiftInventoryItem } from "@roulette/shared";

const nftRoutes: FastifyPluginAsync = async (app) => {
  app.get<{ Querystring: { address?: string } }>("/nft", async (req) => {
    const address = req.query.address ?? req.tgUser.id.toString();
    return NftService.getNfts(address);
  });

  app.post("/nft/claim", async (req, reply) => {
    try {
      return await NftService.claim(req.tgUser.id);
    } catch (err: unknown) {
      const e = err as { statusCode?: number; nextClaimAt?: Date; message?: string };
      if (e.statusCode === 429) {
        return reply.code(429).send({
          error: "TooEarly",
          message: "Claim not available yet",
          nextClaimAt: e.nextClaimAt?.toISOString(),
        });
      }
      throw err;
    }
  });

  // ── GET /inventory ──────────────────────────────────────────────────────────
  // Возвращает Telegram-гифты пользователя (отправленные им на профиль бота)
  app.get("/inventory", async (req): Promise<GiftInventoryItem[]> => {
    const gifts = await prisma.gift.findMany({
      where: { userId: BigInt(req.tgUser.id) },
      orderBy: { receivedAt: "desc" },
    });

    return gifts.map((g) => ({
      id:           g.id,
      tgGiftId:     g.tgGiftId,
      thumbnailUrl: g.thumbnailUrl,
      emoji:        g.emoji,
      starCount:    g.starCount,
      isUpgraded:   g.isUpgraded,
      receivedAt:   g.receivedAt.toISOString(),
    }));
  });
};

export default nftRoutes;
