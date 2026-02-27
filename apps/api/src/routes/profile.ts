import type { FastifyPluginAsync } from "fastify";
import { ProfileService } from "../services/ProfileService.js";

const profileRoutes: FastifyPluginAsync = async (app) => {
  app.get("/profile", async (req) => {
    return ProfileService.getProfile(req.tgUser.id);
  });

  app.patch<{ Body: { walletAddress: string } }>(
    "/profile/wallet",
    {
      schema: {
        body: {
          type: "object",
          required: ["walletAddress"],
          properties: {
            walletAddress: {
              type: "string",
              minLength: 10,
              maxLength: 100,
              // TON адреса: user-friendly (EQ/UQ + base64) или raw (0:<hex>)
              pattern: "^(EQ|UQ)[A-Za-z0-9_-]{46}$|^0:[a-fA-F0-9]{64}$",
            },
          },
        },
      },
    },
    async (req) => {
      await ProfileService.setWallet(req.tgUser.id, req.body.walletAddress);
      return { ok: true };
    }
  );
};

export default profileRoutes;
