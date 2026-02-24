import type { FastifyPluginAsync } from "fastify";
import { ProfileService } from "../services/ProfileService.js";

const profileRoutes: FastifyPluginAsync = async (app) => {
  app.get("/profile", async (req) => {
    return ProfileService.getProfile(req.tgUser.id);
  });

  app.patch<{ Body: { walletAddress: string } }>(
    "/profile/wallet",
    { schema: { body: { type: "object", required: ["walletAddress"], properties: { walletAddress: { type: "string" } } } } },
    async (req) => {
      await ProfileService.setWallet(req.tgUser.id, req.body.walletAddress);
      return { ok: true };
    }
  );
};

export default profileRoutes;
