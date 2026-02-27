import { useState, useMemo, useEffect, useCallback } from "react";
import { MagnifyingGlassIcon } from "@/components/ui/icons";
import { api } from "@/api/client";
import type { UniqueGiftItem } from "@roulette/shared";

// ── Search icon ───────────────────────────────────────────────────────────────

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="7.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

// ── Gift card ─────────────────────────────────────────────────────────────────

interface GiftCardProps {
  gift: UniqueGiftItem;
}

function GiftCard({ gift }: GiftCardProps) {
  const [imgError, setImgError] = useState(false);

  // Extract number from name e.g. "Candy Cane #200731" → "#200731"
  const match = gift.name.match(/#(\d+)$/);
  const itemNumber = match ? `#${match[1]}` : null;
  const baseName = itemNumber ? gift.name.replace(/#\d+$/, "").trim() : gift.name;

  const priceLabel =
    gift.priceTon % 1 === 0
      ? `${gift.priceTon} TON`
      : `${gift.priceTon.toFixed(2)} TON`;

  return (
    <a
      href={gift.getgemsUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="rounded-[18px] overflow-hidden flex flex-col"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.07)",
        textDecoration: "none",
      }}
    >
      {/* Thumbnail */}
      <div
        className="relative flex items-center justify-center"
        style={{ aspectRatio: "1 / 1", background: "rgba(255,255,255,0.03)" }}
      >
        {gift.thumbnailUrl && !imgError ? (
          <img
            src={gift.thumbnailUrl}
            alt={gift.name}
            className="w-full h-full object-contain p-1.5"
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="select-none" style={{ fontSize: 36, lineHeight: 1 }}>
            🎁
          </span>
        )}

        {/* TON price badge bottom-left */}
        <span
          className="absolute bottom-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
          style={{
            background: "rgba(0,136,204,0.85)",
            color: "#fff",
            backdropFilter: "blur(4px)",
          }}
        >
          {priceLabel}
        </span>
      </div>

      {/* Info */}
      <div className="px-2.5 pt-1.5 pb-2 flex flex-col gap-0.5">
        <p className="text-[11px] font-semibold text-white leading-tight truncate">
          {baseName}
        </p>
        {itemNumber && (
          <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>
            {itemNumber}
          </p>
        )}
      </div>
    </a>
  );
}

// ── Skeleton card ─────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div
      className="rounded-[18px] overflow-hidden flex flex-col animate-pulse"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div style={{ aspectRatio: "1/1", background: "rgba(255,255,255,0.05)" }} />
      <div className="px-2.5 pt-1.5 pb-2 flex flex-col gap-1.5">
        <div
          className="h-2.5 rounded-full w-3/4"
          style={{ background: "rgba(255,255,255,0.08)" }}
        />
        <div
          className="h-2.5 rounded-full w-1/3"
          style={{ background: "rgba(255,255,255,0.05)" }}
        />
      </div>
    </div>
  );
}

// ── Filter pill ───────────────────────────────────────────────────────────────

function Pill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all active:scale-95"
      style={{
        background: active ? "var(--accent)" : "rgba(255,255,255,0.07)",
        color: active ? "#fff" : "rgba(255,255,255,0.55)",
        border: active ? "1px solid transparent" : "1px solid rgba(255,255,255,0.1)",
      }}
    >
      {label}
    </button>
  );
}

// ══ ShopPage ══════════════════════════════════════════════════════════════════

export function ShopPage() {
  const [gifts, setGifts] = useState<UniqueGiftItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCollection, setActiveCollection] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<UniqueGiftItem[]>("/shop/unique-gifts")
      .then(setGifts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Top 8 collections by item count
  const collections = useMemo(() => {
    const counts = new Map<string, number>();
    for (const g of gifts) {
      counts.set(g.collectionName, (counts.get(g.collectionName) ?? 0) + 1);
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name]) => name);
  }, [gifts]);

  const filtered = useMemo(() => {
    let result = gifts;
    if (activeCollection) {
      result = result.filter((g) => g.collectionName === activeCollection);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (g) =>
          g.name.toLowerCase().includes(q) ||
          g.collectionName.toLowerCase().includes(q)
      );
    }
    return result;
  }, [gifts, activeCollection, search]);

  const clearSearch = useCallback(() => setSearch(""), []);

  return (
    <div className="min-h-screen pb-28" style={{ background: "var(--bg)" }}>

      {/* Header */}
      <div className="px-4 pt-10 pb-3">
        <h1 className="text-xl font-black text-white tracking-tight">Магазин</h1>
        <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
          Уникальные NFT-подарки · Getgems
        </p>
      </div>

      {/* Search */}
      <div className="px-4 mb-3">
        <div
          className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <span style={{ color: "rgba(255,255,255,0.3)" }}>
            <SearchIcon />
          </span>
          <input
            type="text"
            placeholder="Поиск коллекции"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/25"
          />
          {search && (
            <button
              onClick={clearSearch}
              className="text-white/30 text-lg leading-none"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Collection filter pills */}
      {!loading && collections.length > 0 && (
        <div className="px-4 mb-3 flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          <Pill
            label="Все"
            active={activeCollection === null}
            onClick={() => setActiveCollection(null)}
          />
          {collections.map((name) => (
            <Pill
              key={name}
              label={name}
              active={activeCollection === name}
              onClick={() =>
                setActiveCollection(activeCollection === name ? null : name)
              }
            />
          ))}
        </div>
      )}

      {/* Count */}
      <div className="px-4 mb-3">
        <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.25)" }}>
          {loading ? "Загрузка…" : `${filtered.length} лотов`}
        </p>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="px-4 grid grid-cols-3 gap-2.5">
          {Array.from({ length: 9 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="px-4 grid grid-cols-3 gap-2.5">
          {filtered.map((gift, i) => (
            <div
              key={gift.address}
              className="animate-fade-up"
              style={{ animationDelay: `${Math.min(i * 0.03, 0.4)}s` }}
            >
              <GiftCard gift={gift} />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 py-20">
          <span style={{ color: "rgba(255,255,255,0.12)" }}>
            <MagnifyingGlassIcon size={56} />
          </span>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>
            Ничего не найдено
          </p>
        </div>
      )}
    </div>
  );
}
