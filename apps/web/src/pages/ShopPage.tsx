import { useState, useMemo, useEffect } from "react";
import { CartIcon, MagnifyingGlassIcon, StarIcon } from "@/components/ui/icons";
import { api } from "@/api/client";
import type { ShopGiftItem } from "@roulette/shared";

// ── Icons ─────────────────────────────────────────────────────────────────────

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="7.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

// ── Gift Card ─────────────────────────────────────────────────────────────────

interface GiftCardProps {
  gift: ShopGiftItem;
  inCart: boolean;
  onAdd: () => void;
}

function GiftCard({ gift, inCart, onAdd }: GiftCardProps) {
  return (
    <div
      className="rounded-[18px] overflow-hidden flex flex-col"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Image / emoji preview */}
      <div
        className="relative flex items-center justify-center"
        style={{ aspectRatio: "1 / 1", background: "rgba(255,255,255,0.03)" }}
      >
        {gift.thumbnailUrl ? (
          <img
            src={gift.thumbnailUrl}
            alt={gift.name}
            className="w-full h-full object-contain p-2"
          />
        ) : (
          <span className="select-none" style={{ fontSize: 40, lineHeight: 1 }}>
            {gift.emoji ?? "🎁"}
          </span>
        )}

        {/* Limited badge */}
        {gift.isLimited && (
          <span
            className="absolute top-1.5 right-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
            style={{ background: "linear-gradient(135deg,#f5c842,#c8960c)", color: "#fff" }}
          >
            LTD
          </span>
        )}
      </div>

      {/* Info */}
      <div className="px-2.5 pt-2 pb-2.5 flex flex-col gap-1">
        <p className="text-[12px] font-semibold text-white leading-tight truncate">{gift.name}</p>

        {gift.isLimited && gift.remainingCount != null && (
          <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>
            Осталось {gift.remainingCount.toLocaleString()}
          </p>
        )}

        {/* Price + Add */}
        <div className="flex items-center justify-between mt-0.5">
          <div className="flex items-center gap-1">
            <StarIcon size={12} />
            <span className="text-[12px] font-bold text-white">{gift.starCount}</span>
          </div>
          <button
            onClick={onAdd}
            className="w-6 h-6 rounded-full flex items-center justify-center transition-all active:scale-90 text-sm font-bold"
            style={{
              background: inCart ? "rgba(0,136,204,0.25)" : "var(--accent)",
              color: "#fff",
            }}
          >
            {inCart ? "✓" : "+"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Skeleton card ─────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div
      className="rounded-[18px] overflow-hidden flex flex-col animate-pulse"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <div style={{ aspectRatio: "1/1", background: "rgba(255,255,255,0.05)" }} />
      <div className="px-2.5 pt-2 pb-2.5 flex flex-col gap-2">
        <div className="h-3 rounded-full w-3/4" style={{ background: "rgba(255,255,255,0.08)" }} />
        <div className="h-3 rounded-full w-1/2" style={{ background: "rgba(255,255,255,0.05)" }} />
      </div>
    </div>
  );
}

// ══ ShopPage ══════════════════════════════════════════════════════════════════

export function ShopPage() {
  const [gifts, setGifts] = useState<ShopGiftItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showLimited, setShowLimited] = useState(false);
  const [cart, setCart] = useState<Set<string>>(new Set());

  useEffect(() => {
    api.get<ShopGiftItem[]>("/shop/gifts")
      .then(setGifts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return gifts.filter((g) => {
      const matchSearch = g.name.toLowerCase().includes(q);
      const matchLimited = !showLimited || g.isLimited;
      return matchSearch && matchLimited;
    });
  }, [gifts, search, showLimited]);

  function toggleCart(id: string) {
    setCart((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const cartCount = cart.size;

  return (
    <div className="min-h-screen pb-28" style={{ background: "var(--bg)" }}>

      {/* Header */}
      <div className="px-4 pt-10 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">Магазин</h1>
            <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
              Подарки Telegram
            </p>
          </div>

          {cartCount > 0 && (
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full animate-scale-in"
              style={{
                background: "rgba(0,136,204,0.15)",
                border: "1px solid rgba(0,136,204,0.3)",
                color: "var(--accent)",
              }}
            >
              <CartIcon size={16} />
              <span className="text-sm font-bold">{cartCount}</span>
            </div>
          )}
        </div>
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
            placeholder="Поиск гифта"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/25"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-white/30 text-lg leading-none">
              ×
            </button>
          )}
        </div>
      </div>

      {/* Filter chips */}
      <div className="px-4 mb-4 flex items-center gap-2">
        <button
          onClick={() => setShowLimited((v) => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
          style={{
            background: showLimited ? "rgba(245,200,66,0.15)" : "rgba(255,255,255,0.06)",
            border: `1px solid ${showLimited ? "rgba(245,200,66,0.4)" : "rgba(255,255,255,0.08)"}`,
            color: showLimited ? "#f5c842" : "rgba(255,255,255,0.55)",
          }}
        >
          <span
            className="text-[9px] font-bold px-1 rounded-full"
            style={{
              background: showLimited ? "#f5c842" : "rgba(255,255,255,0.15)",
              color: showLimited ? "#000" : "rgba(255,255,255,0.5)",
            }}
          >
            LTD
          </span>
          Лимитированные
        </button>
      </div>

      {/* Count */}
      <div className="px-4 mb-3">
        <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.25)" }}>
          {loading ? "Загрузка…" : `${filtered.length} подарков`}
        </p>
      </div>

      {/* Gift grid */}
      {loading ? (
        <div className="px-4 grid grid-cols-3 gap-2.5">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length > 0 ? (
        <div className="px-4 grid grid-cols-3 gap-2.5">
          {filtered.map((gift, i) => (
            <div
              key={gift.id}
              className="animate-fade-up"
              style={{ animationDelay: `${Math.min(i * 0.04, 0.4)}s` }}
            >
              <GiftCard
                gift={gift}
                inCart={cart.has(gift.id)}
                onAdd={() => toggleCart(gift.id)}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 py-20">
          <span style={{ color: "rgba(255,255,255,0.12)" }}><MagnifyingGlassIcon size={56} /></span>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>
            Ничего не найдено
          </p>
        </div>
      )}
    </div>
  );
}
