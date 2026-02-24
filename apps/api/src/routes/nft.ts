import type { FastifyPluginAsync } from "fastify";
import { NftService } from "../services/NftService.js";

const nftRoutes: FastifyPluginAsync = async (app) => {
  app.get<{ Querystring: { address?: string } }>("/nft", async (req, reply) => {
    const address = req.query.address ?? req.tgUser.id.toString();
    // Если нет адреса кошелька — возвращаем пустой массив
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
};

export default nftRoutes;
