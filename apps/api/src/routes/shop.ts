import type { FastifyPluginAsync } from "fastify";
import { GiftsService } from "../services/GiftsService.js";
import type { ShopGiftItem } from "@roulette/shared";

const shopRoutes: FastifyPluginAsync = async (app) => {
  // GET /shop/gifts — catalog of all available Telegram gifts (via Bot API)
  app.get("/shop/gifts", async (): Promise<ShopGiftItem[]> => {
    return GiftsService.getShopGifts();
  });
};

export default shopRoutes;
