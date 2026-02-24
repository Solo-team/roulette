import type { NftItem, NftAttribute, NftClaimResult } from "@roulette/shared";
import { config } from "../config/index.js";
import { prisma } from "../lib/prisma.js";

const CLAIM_REWARD = 100;
const CLAIM_COOLDOWN_MS = 24 * 60 * 60 * 1000;

// Простой in-memory кэш (address → { data, expiry })
const cache = new Map<string, { data: NftItem[]; expiry: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000;

function isGetgems(meta: { marketplace?: string; external_url?: string } | undefined): boolean {
  if (!meta) return false;
  return (
    meta.marketplace === "getgems.io" ||
    (meta.external_url?.includes("getgems.io") ?? false)
  );
}

export class NftService {
  static async getNfts(walletAddress: string): Promise<NftItem[]> {
    const cached = cache.get(walletAddress);
    if (cached && cached.expiry > Date.now()) return cached.data;

    const url = `https://tonapi.io/v2/accounts/${walletAddress}/nfts?limit=100&indirect_ownership=true`;
    const res = await fetch(url, {
      headers: config.tonApiKey ? { Authorization: `Bearer ${config.tonApiKey}` } : {},
    });

    if (!res.ok) return [];

    const json = (await res.json()) as {
      nft_items?: Array<{
        address: string;
        metadata?: {
          name?: string;
          image?: string;
          marketplace?: string;
          external_url?: string;
          attributes?: Array<{ trait_type?: string; value?: string }>;
        };
        collection?: { name?: string };
        previews?: Array<{ resolution: string; url: string }>;
      }>;
    };

    const items: NftItem[] = (json.nft_items ?? [])
      .filter((n) => isGetgems(n.metadata))
      .map((n) => {
        const preview500 = n.previews?.find((p) => p.resolution === "500x500")?.url ?? "";
        const attributes: NftAttribute[] = (n.metadata?.attributes ?? []).map((a) => ({
          trait_type: a.trait_type ?? "",
          value: String(a.value ?? ""),
        }));
        return {
          address: n.address,
          name: n.metadata?.name ?? "Unknown NFT",
          image: n.metadata?.image || preview500,
          collection: n.collection?.name ?? null,
          attributes,
          externalUrl: n.metadata?.external_url ?? null,
        };
      });

    cache.set(walletAddress, { data: items, expiry: Date.now() + CACHE_TTL_MS });
    return items;
  }

  static async claim(userId: number): Promise<NftClaimResult> {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: BigInt(userId) } });

    const now = Date.now();
    if (user.lastClaimAt && now - user.lastClaimAt.getTime() < CLAIM_COOLDOWN_MS) {
      const nextClaimAt = new Date(user.lastClaimAt.getTime() + CLAIM_COOLDOWN_MS);
      throw Object.assign(new Error("Too early"), { statusCode: 429, nextClaimAt });
    }

    const updated = await prisma.user.update({
      where: { id: BigInt(userId) },
      data: {
        coins: { increment: CLAIM_REWARD },
        lastClaimAt: new Date(),
      },
    });

    const nextClaimAt = new Date(Date.now() + CLAIM_COOLDOWN_MS);
    return {
      coins: updated.coins,
      nextClaimAt: nextClaimAt.toISOString(),
    };
  }
}
