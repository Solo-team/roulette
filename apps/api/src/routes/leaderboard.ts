import type { FastifyPluginAsync } from "fastify";
import { LeaderboardService } from "../services/LeaderboardService.js";

const leaderboardRoutes: FastifyPluginAsync = async (app) => {
  app.get("/leaderboard", async () => {
    return LeaderboardService.getTop();
  });
};

export default leaderboardRoutes;
