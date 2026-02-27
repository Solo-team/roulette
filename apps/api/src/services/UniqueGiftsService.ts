import type { UniqueGiftItem } from "@roulette/shared";
import { config } from "../config/index.js";

// ── Telegram gift collection addresses on TON ──────────────────────────────────
// Each address is a verified Telegram exclusive gift NFT collection.
// Multiple addresses per gift type exist because Telegram deploys new batch
// contracts as each one fills up.

const COLLECTION_ADDRESSES: string[] = [
  // Candy Canes
  "0:cb33ae6dd2c852ee064083494c96d187621b14f783f3b0c24785889b99157b91",
  // B-Day Candles
  "0:b01057d46db47edb67e7dd583152906297b6f0050a841e6ef081061b598f5cd3",
  // Jelly Bunnies
  "0:c6c9794522e6632a461c08b8203077dbf7efbe5bf98d46494ff00d70a8607eac",
  // Signet Rings
  "0:22d21d0b3c9b46ee9c5fdff6b13bd1a2f5648862debc3a5c33cb337c8b578301",
  "0:76f654bf88267e90cef9db575248723dc732da1fb1a37c5fde1c4461d4e9f8c8",
  "0:70ed66a3294cb38bbf122e6300e501ef6475ad0558c54ac924bece82a3870942",
  // Plush Pepes
  "0:adc95fa2a7c59cd29d364a582d38beaa4b1e4c8ad9c727a75fd095cc1318a012",
  "0:de8aab82671015e929ed20624403d33c410e2ed3253ddb8debda1450eeb195c5",
  "0:0641ec1d1f9a41110b11666b91743f0452b3d52eb26a95b9c676889567fd9c83",
  "0:86e5a611b50f27b63f7f291419f9aabd804b886d424feaa1b07391d2cf6abf6b",
  "0:da5134bf65a392ffdd696b1d8552302176a918351c26c5b8fee2636973680706",
  "0:9a8a3151709de7d1b3b2233b9cb867c9122f31b4f2ac4e866793716cfcf15e2d",
  "0:e3a0e2cb2666bb3f14a1e0849beb60272127723da7babcb2a558837aff5434f9",
  "0:af9c5e62ed3243e1c9f9c2d439a076cee350a376cfaf85a52d8f731bff84ef42",
  "0:f17a59c56a1789ff964e7eddb221c9a7a17d7ff4230038b726326e821edaa8e8",
  "0:f94e368ac67b7677d0e0734386962ea4c77b506ae48752b70b9aa2f5b9358bf1",
  "0:5a8aefb5537ef8bb88a9899a3153383a9430880696656f6bf129b7503ed4cb7a",
  // Perfume Bottles
  "0:1b9d1fa21e7fc3652332ad755c81c4bedf1b78cd029d22c0e8a9f0586732d4e7",
  "0:13823580cafb1c06e1021b1352d87fd85411922381579774f0ec6c83563bd7b6",
  "0:86a7b51ba6bf75658f3964e0e18aff0baeff8cfa28383e0ac387109afad291d9",
  "0:b29b04e26c8665a2acb91f10bacdfc03379b1b868a949eb96c02f68d5c7415ee",
  "0:f99745d3af64291c0489e468152a1fecddb14d5ab3263aaf36c404d78ac7d040",
  "0:1a3298c144de5277d8356e01c31909d8e44a398890c8e5d59a795446b35c6a3a",
  "0:e05c3cdb857de30181aa17619f663607bf08bf4d37056c4e8ee6a7bb7e512fdf",
  "0:b8e3a5e86994142c59c28b961d8a32d399ebc0a5097c419438311c75120dc08e",
  "0:aeeaf04bf8b45ce621ec133af25fb438cf1171bbf241db42221afbd208297c6a",
  "0:af12b98bfa145673e9676066f3e62f67b26e3c4c75747d55b22c3377d14f4dd6",
  "0:0fb7bb5612b79a4006e6cc3c345d91f7caebf8365f493ce416e480f710f0d85b",
  "0:bc743690bf4862917e6147e51ff83286c82773c0760b4b7f0d106490ad2043d7",
  "0:5b54901bad7fab2b633ffea78aa73cfc40365ff5212f752ee6f940d2ede36794",
  "0:2dac964e14354bfb9cb1f911428c22845ee3cb33bb7dfdde29215c06778df02f",
  // Precious Peaches
  "0:8e6b124ff41c1d5d52959f1834459cf2aa2d20ef1ace99eb768da934dc2a75f5",
  "0:18726f7170d7b8b47e40503870b4a8dd4eb204d67df267c6f9d7f06292d7a881",
  "0:169f9ce320612344679a93344d8057e16d9e4968e237d884cad89b996ecbd380",
  "0:3c467971217688a2f42d100884bd94d1169de7135e0cbb0b731ce358d5342f9a",
  "0:ba2b5d89d99d138d1a185fd1b19ebd42a034dd2b817308a550e318bff82f3f7f",
  "0:cd5df216bd44e6273a7b3b999efb66090f2914af03641373a541f9c59b5292a0",
  "0:388b9f22b92f4351846d519f7bb19a399a791b898501a565d039eddd11409c3f",
  "0:e411a883717c5e61f281fa26f20cc3261e43bca14d406c6b633ea66aa880f95d",
  "0:d7474cdaa3bf4724806ba92df55ed46e2d4fea5b5580c504a52d89b2ec902a1a",
  "0:8eedd8a52106d2f0cd7c1cd3faf602d2ddee1b8b67394ccc9a15fec580c94fe3",
  "0:9fc0e4d96422e039a7a749892c1eecf4ce257565fb2ed825c6349806b62e04fa",
  // Ion Gems
  "0:48ce225ca297b41f6e08c893f34586afafc03da36931940e3995968306c42514",
  "0:34c392dfe0ffec35038ed40052a5b51b7d1d28cc69a5964211c7ee3085fb4f9f",
  "0:aadf7c9f9631314e52c1803a8382d6cf819967cb576983788795e17dd9cec33a",
  "0:43f8095446ca3cbcd5ed319f1035c7082e60990e4d3e371f8fddc030ec3cc062",
  "0:def24b733555938a40ac359e0bd9d0c3ce2f91e13e5d2a393ecfd56780792da1",
  // Astral Shards
  "0:bd9ca89e71bfd232244a692f3caa7bbe73715a5c1adf16df17360844fe8f15e0",
  "0:87e275a080ea4ceb82652d8c6c64552f365a750b108874b887436d8a4a7f5333",
  "0:425d88aeac892e9b03322c3fac4fd46a5f94af57cf04f949941a364a8d20e08d",
  "0:9548b0f28586651c3c8abd583e7e02fd061d98aa6021516cfcde1c94764e0b3c",
  "0:c845e95e3a44f1083e20fd7126f318f42d8360ebecccb13180030080faf11b90",
  "0:0c9402d5b9306ff7176b458a288b492edc658bdecb1a4081843c3a1427b074c9",
  "0:fff467b233fe8210e17f539c49dd03b80c0dbf54d2236843dbf58a4393068891",
  "0:bbe35f09f2bebd30975cdf0e6f1ed7c9e51323bc62c1e282d8afebc740392b8a",
  // Swiss Watches
  "0:13ba2ea366c146791d4ab08ae793600674fa9e084cd5828b4c45ea3cfe88c273",
  "0:c06a7a4f803241bab68fd186dcf613e00f18a9eeffe7b911d6aa0ec678ed4985",
  "0:ace540888015db4f0f856771ffd69c0b3b37643945936a0619ba72a871cddb0e",
  "0:d7cf5b2e27e4605b43fb67efd05e8b9f38ef0407102d6d68732d22e77ee93afc",
  // Durov's Caps
  "0:324dea94c7db02ba5c258a7ca0876306b4c074bfe35486e40ba4bc34812406b3",
  "0:52d91ea9d5b88bd420aeb421a73babbd9ecb0429861380cbab840273c37161c5",
  "0:fd8a466aeb13e02a3ce67411b41b44bcd11bd42636f0807acf6570ca73fc2c13",
  "0:e28ce732b71c01cdd5ed076ed1f5023050a037aeb0ee1076c7660693c6e830f2",
  // Toy Bears
  "0:cb739669a1ef06e55e20f02567d47704cab4152b478c4214bb20355a1b45b52b",
  "0:9fbab11e8a8f473331505d995a96b434fd2a777d31483e64e7fdbcfcecabfbfc",
  // Vintage Cigars
  "0:dbe6529f6db76307933454cd8f831eeae63b1561ac4eda4a4f5517cf72e400ba",
  "0:9a7f40dc233d63d1aef862e691a4cff5cf3d244b7c22b1cb83c5457b92ff33b6",
  "0:975dd47f29dc0bb08d203a2fb8d1b932e7eeb4b2866668352595cf078a7ff2f8",
  // Heart Lockets
  "0:2764627d59c4c8d047159ff9dc5d0ab4c819af5375c063a3669617026062ea2f",
  "0:fc8afdf26fff64317be21d278854512f7265ad61e4126eb40f1f0b33fe9043b9",
  "0:52a38df251d44f4c825a8e8dda3ff731aad235b9154a6e4e6450ac7452d79510",
  "0:b54c9dc0f3fc5e2126f0e75e5377b83a4b0ba496f5e3f2adabe32a98dcb7db34",
  // Single-collection gift types
  "0:ebef92a117d3ac369284681f8e5ccf3b0e7a0515a1b469460e7acba8656aed7c", // Ginger Cookies
  "0:890395c12fa6d0af0b8a7e5db424f877b5473014f1c6eeda1511468805052af6", // Artisan Bricks
  "0:8305b4186efde7f754f0cb00510fd62b24db8d5666c3dd2a6ba6aea15880c756", // Sakura Flowers
  "0:e305dbb7cd2f894fde0ec08ba9e0a54d6908f10f319c20f449db81dad18f232f", // Valentine Boxes
  "0:ea1f04b353823f538e2f48cf440cfe07186296cbdc968dbce4a426b72bc88c04", // Love Candles
  "0:198ee50999b3fe578472a308dec61edb21c74daeba23af458a4a9760801d336e", // Nail Bracelets
  "0:53db1ac2883c62e105e9f0782878cfd2ee096b7f524c9b6f830a338b82e958ad", // Scared Cat
  "0:b14482a1147ce6861d639a105581c3c6b86e80bdbbfd0118fec054cf4052b133", // Heroic Helmets
  "0:eb916882e73c887c31fc6ff830be1083e6704521c410113d43285eb94c05078c", // Kissed Frogs
  "0:54ad3f2fc71427461e5ba8f04725ef639580988519d1019e618f10624fdc6e36", // Bonded Rings
  "0:971de60f3d913733cc651e2ac621b6b4f054f171377492f23dc4ddd9f11d6170", // Mini Oscars
  "0:40413e7ba149225e525f2d85b0568e30828d74c7b9548997d06d8e8ccbb108bf", // Mini Oscars 2
  "0:11bdc782d63108a9a4981c269c056d64083c0cfc55c0eae55f9cac34191b9f09", // Mini Oscars 3
  "0:63cdd8b6ed923e45ef7738e2226b49bb626514f1df2e6c936c4ad65373ba8d26", // Mousse Cakes
  "0:d0178d43778651465bd35aa43a6e7040d14d18a52b1049ebeec1d37e96c62b0d", // Stellar Rocket
  "0:147df416974f7fca15c34e9f28375dcfc7cca03e6d317323468473a238d57ec7", // Fresh Socks
  "0:7cccbcc438540adea4f231880f0fc06ece63706e59e8baa681f343d6facd84ee", // Hanging Stars
  "0:7414d006b8f910e102f197a7255ba1e8ef0a0f97337f4ce3c909bbd83c58d344", // Hanging Stars 2
  "0:bba0f6be8090d9e894705b4596e161ff5639fb8a82a67c374522d0fb9d814675", // Moon Pendants
  "0:812bf241012000e57573d43d7b3e7fbe91068c5a6d1bf7045e56db047513b84e", // Jester Hats
  "0:c62670d3c4878aad23542527b1d3087e1ee97ed01a21524dad83a62b69e33c3c", // Money Pots
  "0:9e7c1cc949ae78f7a4b86f9ec9508131bca8525d99b97edcb44f12b5f514626a", // Holiday Drink
  "0:d870ca7afac7e561bc88e0ad2c9e5dade007a4507fdede5bede6137b13822b27", // Speed Cats
  "0:505ae476643a4b51b0e0f7379a06c1f4be9b7cb24c89a63f1709fc21e50a64ae", // Speed Cats 2
  "0:2d81b8521cea93c63b912cb38069be93eba14f71059335dfc34f7560086d7eb4", // Crystal Balls
  "0:412d116d0bfdcf2f1369597e677dc8706a993b796706dddccaa316d5e9c5b3a9", // Pet Snakes
  "0:effcddf04d052fdda2582cba99d4c986958686c6c2e7ae32c2459b7e73eb7e15", // Top Hats
  "0:25afa71cc5ec9c3f8020a80046e31f248bf3b96e1f52fa535c221e533f72c6a1", // Top Hats 2
  "0:d730092a0338c47ff6d6c3712965b0ca9158c89ad0d95bb6cb3c0504a1978a55", // Trapped Hearts
  "0:341334585f9c26feae3afcd5fc6fb11886d3a45df5e0b2bd3a1136e8bf56bb4a", // Pretty Posies
  "0:5b982e45220d4f50ee14ba864038e670302f0e0917c92eeba35ed0aee77e4f6a", // Eternal Candles
  "0:4818a882b9c3f6cb11c76ae7e7261969693a531de651f385effbc16a341a02a6", // Xmas Stockings
  "0:ce3630a8a9efb80f8869a8307410872906140de94a5ffbc681077c25c804e627", // Sleigh Bells
];

// ── Tonapi response types ──────────────────────────────────────────────────────

interface TonApiNftItem {
  address: string;
  collection?: { address: string; name?: string };
  metadata?: {
    name?: string;
    image?: string;
    attributes?: Array<{ trait_type?: string; value?: unknown }>;
  };
  previews?: Array<{ resolution: string; url: string }>;
  sale?: {
    address?: string;  // sale contract address (for direct purchase)
    market?: { address: string; name?: string };
    price?: { currency_type: string; value: string; decimals: number };
  };
  trust?: string;
  approved_by?: string[];
}

interface TonApiCollectionItemsResponse {
  nft_items?: TonApiNftItem[];
}

// ── Cache ──────────────────────────────────────────────────────────────────────

let cache: { data: UniqueGiftItem[]; expiry: number } | null = null;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

// Known Getgems market addresses (to filter out other marketplaces)
const GETGEMS_MARKETS = new Set([
  "0:584ee61b2dff0837116d0fcb5078d93964bcbe9c05fd6a141b1bfca5d6a43e18",
]);

// ── Helpers ────────────────────────────────────────────────────────────────────

function isTrustedSale(item: TonApiNftItem): boolean {
  if (!item.sale?.price) return false;
  if (item.sale.price.currency_type !== "native") return false; // must be TON
  const marketAddr = item.sale.market?.address ?? "";
  return GETGEMS_MARKETS.has(marketAddr);
}

function getPreview(item: TonApiNftItem): string | null {
  const p500 = item.previews?.find((p) => p.resolution === "500x500")?.url;
  return p500 ?? item.metadata?.image ?? null;
}

async function fetchCollectionSales(address: string): Promise<UniqueGiftItem[]> {
  const headers: Record<string, string> = {
    "User-Agent": "Mozilla/5.0",
    ...(config.tonApiKey ? { Authorization: `Bearer ${config.tonApiKey}` } : {}),
  };

  try {
    const res = await fetch(
      `https://tonapi.io/v2/nfts/collections/${address}/items?limit=100`,
      { headers }
    );
    if (!res.ok) return [];

    const data = (await res.json()) as TonApiCollectionItemsResponse;
    const items = data.nft_items ?? [];

    return items
      .filter(isTrustedSale)
      .map((item): UniqueGiftItem => {
        const priceNanoStr = item.sale!.price!.value;
        const priceTon = Number(BigInt(priceNanoStr)) / 1e9;

        const attrs = (item.metadata?.attributes ?? []).map((a) => ({
          trait_type: String(a.trait_type ?? ""),
          value: String(a.value ?? ""),
        }));

        return {
          address: item.address,
          name: item.metadata?.name ?? "Unknown Gift",
          collectionName: item.collection?.name ?? "Telegram Gifts",
          thumbnailUrl: getPreview(item),
          priceTon,
          priceNano: priceNanoStr,
          saleAddress: item.sale?.address ?? null,
          attributes: attrs,
          getgemsUrl: `https://getgems.io/nft/${item.address}`,
        };
      });
  } catch {
    return [];
  }
}

// ── Service ────────────────────────────────────────────────────────────────────

export class UniqueGiftsService {
  static async getForSaleItems(): Promise<UniqueGiftItem[]> {
    if (cache && cache.expiry > Date.now()) return cache.data;

    const BATCH_SIZE = 8;
    const results: UniqueGiftItem[] = [];

    for (let i = 0; i < COLLECTION_ADDRESSES.length; i += BATCH_SIZE) {
      const batch = COLLECTION_ADDRESSES.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(
        batch.map((addr) => fetchCollectionSales(addr))
      );
      for (const items of batchResults) {
        results.push(...items);
      }
    }

    // Deduplicate by NFT address (in case the same NFT appears in multiple fetches)
    const seen = new Set<string>();
    const unique = results.filter((item) => {
      if (seen.has(item.address)) return false;
      seen.add(item.address);
      return true;
    });

    // Sort by price ascending (cheapest first)
    unique.sort((a, b) => a.priceTon - b.priceTon);

    cache = { data: unique, expiry: Date.now() + CACHE_TTL_MS };
    return unique;
  }

  static invalidateCache(): void {
    cache = null;
  }
}
