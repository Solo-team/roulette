import type { FastifyPluginAsync } from "fastify";
import { ReferralService } from "../services/ReferralService.js";

const referralRoutes: FastifyPluginAsync = async (app) => {
  app.get("/referrals", async (req) => {
    return ReferralService.getInfo(req.tgUser.id);
  });
};

export default referralRoutes;
