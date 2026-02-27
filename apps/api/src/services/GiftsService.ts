import type { ShopGiftItem } from "@roulette/shared";
import { config } from "../config/index.js";

// ── Telegram API types ─────────────────────────────────────────────────────────

interface TgPhotoSize {
  file_id: string;
  file_unique_id: string;
  width: number;
  height: number;
}

interface TgSticker {
  file_id: string;
  file_unique_id: string;
  type: string;
  is_animated: boolean;
  is_video: boolean;
  emoji?: string;
  set_name?: string;
  thumbnail?: TgPhotoSize;
}

interface TgGift {
  id: string;
  sticker: TgSticker;
  star_count: number;
  upgrade_star_count?: number;
  total_count?: number;
  remaining_count?: number;
}

interface TgGetAvailableGiftsResult {
  ok: boolean;
  result?: { gifts: TgGift[] };
}

// ── In-memory cache ────────────────────────────────────────────────────────────

let cache: { data: ShopGiftItem[]; expiry: number } | null = null;
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 min

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Converts a sticker set_name to a human-readable gift name.
 *  e.g. "gift_lunar_snake" → "Lunar Snake"
 *       "unique_golden_star" → "Golden Star" */
function setNameToTitle(setName: string): string {
  return setName
    .replace(/^(?:gift|unique)_/i, "")
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** Resolves a Telegram file_id to a direct download URL via getFile Bot API. */
async function resolveFileUrl(fileId: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://api.telegram.org/bot${config.botToken}/getFile?file_id=${fileId}`
    );
    const data = (await res.json()) as {
      ok: boolean;
      result?: { file_path?: string };
    };
    if (data.ok && data.result?.file_path) {
      return `https://api.telegram.org/file/bot${config.botToken}/${data.result.file_path}`;
    }
  } catch { /* ignore */ }
  return null;
}

// ── Service ────────────────────────────────────────────────────────────────────

export class GiftsService {
  static async getShopGifts(): Promise<ShopGiftItem[]> {
    if (cache && cache.expiry > Date.now()) return cache.data;

    // Fetch available gifts from Telegram Bot API
    const res = await fetch(
      `https://api.telegram.org/bot${config.botToken}/getAvailableGifts`
    );
    const data = (await res.json()) as TgGetAvailableGiftsResult;

    if (!data.ok || !data.result?.gifts?.length) {
      return cache?.data ?? [];
    }

    // Resolve thumbnails in parallel (limit concurrency to avoid rate limiting)
    const BATCH = 5;
    // Только коллекционные подарки — те, что можно апгрейдить до уникального NFT.
    // Обычные подарки (без upgrade_star_count) не показываем.
    const gifts = data.result.gifts.filter((g) => g.upgrade_star_count != null);
    const items: ShopGiftItem[] = [];

    for (let i = 0; i < gifts.length; i += BATCH) {
      const batch = gifts.slice(i, i + BATCH);
      const resolved = await Promise.all(
        batch.map(async (g): Promise<ShopGiftItem> => {
          const thumbFileId = g.sticker.thumbnail?.file_id ?? g.sticker.file_id;
          const thumbnailUrl = await resolveFileUrl(thumbFileId);

          const name = g.sticker.set_name
            ? setNameToTitle(g.sticker.set_name)
            : (g.sticker.emoji ?? `Gift ${g.id.slice(-4)}`);

          return {
            id: g.id,
            name,
            emoji: g.sticker.emoji ?? null,
            thumbnailUrl,
            starCount: g.star_count,
            upgradeStarCount: g.upgrade_star_count!, // всегда присутствует после фильтра
            isLimited: g.total_count != null,
            totalCount: g.total_count,
            remainingCount: g.remaining_count,
          };
        })
      );
      items.push(...resolved);
    }

    cache = { data: items, expiry: Date.now() + CACHE_TTL_MS };
    return items;
  }

  /** Invalidates the cache (useful after bot restarts or forced refresh). */
  static invalidateCache(): void {
    cache = null;
  }
}
