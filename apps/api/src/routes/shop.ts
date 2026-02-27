import type { FastifyPluginAsync } from "fastify";
import { GiftsService } from "../services/GiftsService.js";
import { UniqueGiftsService } from "../services/UniqueGiftsService.js";
import type { ShopGiftItem, UniqueGiftItem } from "@roulette/shared";

const shopRoutes: FastifyPluginAsync = async (app) => {
  // GET /shop/gifts — catalog of collectible Telegram gifts (via Bot API)
  app.get("/shop/gifts", async (): Promise<ShopGiftItem[]> => {
    return GiftsService.getShopGifts();
  });

  // GET /shop/unique-gifts — secondary marketplace listings of unique Telegram gift NFTs
  // Query params: limit (default 100), offset (default 0), collection (filter by collectionName)
  app.get("/shop/unique-gifts", async (req): Promise<UniqueGiftItem[]> => {
    const { limit = "100", offset = "0", collection = "" } = req.query as Record<string, string>;
    const all = await UniqueGiftsService.getForSaleItems();

    const filtered = collection
      ? all.filter((g) => g.collectionName.toLowerCase() === collection.toLowerCase())
      : all;

    const start = Math.max(0, parseInt(offset, 10) || 0);
    const size  = Math.min(200, Math.max(1, parseInt(limit, 10) || 100));
    return filtered.slice(start, start + size);
  });
};

export default shopRoutes;
