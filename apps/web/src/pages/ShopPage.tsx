import { useState, useMemo, useRef, useEffect } from "react";
import { CartIcon, MagnifyingGlassIcon } from "@/components/ui/icons";

// ── Types ─────────────────────────────────────────────────────────────────────

interface GiftItem {
  id: number;
  name: string;
  number: number;
  price: number;
  type: string;
  skin: string;
  bg: string;
  bgGradient: string;
  accentColor: string;
  emoji: string;
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const GIFTS: GiftItem[] = [
  { id: 1,  name: "Lunar Snake",    number: 93669,  price: 5,  type: "Змея",      skin: "Лунный",     bg: "Полночь",   bgGradient: "linear-gradient(145deg,#0d1b4b,#1a2a7a)", accentColor: "#4e6ef2", emoji: "🐍" },
  { id: 2,  name: "Lunar Snake",    number: 144784, price: 5,  type: "Змея",      skin: "Лунный",     bg: "Сапфир",    bgGradient: "linear-gradient(145deg,#0d2b4b,#0d4a8a)", accentColor: "#3a8ef2", emoji: "🐍" },
  { id: 3,  name: "Lunar Snake",    number: 190498, price: 5,  type: "Змея",      skin: "Лунный",     bg: "Фиолет",    bgGradient: "linear-gradient(145deg,#1e0d4b,#3d1a7a)", accentColor: "#9b4ef2", emoji: "🐍" },
  { id: 4,  name: "Lunar Snake",    number: 71032,  price: 5,  type: "Змея",      skin: "Лунный",     bg: "Полночь",   bgGradient: "linear-gradient(145deg,#0d1b4b,#1a2a7a)", accentColor: "#4e6ef2", emoji: "🐍" },
  { id: 5,  name: "Lunar Snake",    number: 190495, price: 5,  type: "Змея",      skin: "Лунный",     bg: "Сапфир",    bgGradient: "linear-gradient(145deg,#0d2b4b,#0d4a8a)", accentColor: "#3a8ef2", emoji: "🐍" },
  { id: 6,  name: "Ice Cream",      number: 57887,  price: 5,  type: "Мороженое", skin: "Классика",   bg: "Нежный",    bgGradient: "linear-gradient(145deg,#2d1a4b,#5a2a7a)", accentColor: "#d44ef2", emoji: "🍦" },
  { id: 7,  name: "Ice Cream",      number: 62441,  price: 8,  type: "Мороженое", skin: "Золото",     bg: "Закат",     bgGradient: "linear-gradient(145deg,#4b2a0d,#8a4a1a)", accentColor: "#f2844e", emoji: "🍦" },
  { id: 8,  name: "Jelly Bunny",    number: 28843,  price: 3,  type: "Кролик",    skin: "Желе",       bg: "Бирюза",    bgGradient: "linear-gradient(145deg,#0d3b3b,#0d6a5a)", accentColor: "#2ef2c4", emoji: "🐇" },
  { id: 9,  name: "Jelly Bunny",    number: 31200,  price: 3,  type: "Кролик",    skin: "Желе",       bg: "Мята",      bgGradient: "linear-gradient(145deg,#0d4b2a,#1a7a3d)", accentColor: "#4ef28e", emoji: "🐇" },
  { id: 10, name: "Star Spinner",   number: 5510,   price: 15, type: "Звезда",    skin: "Призма",     bg: "Космос",    bgGradient: "linear-gradient(145deg,#0d0d2e,#1a0d3d)", accentColor: "#f2e24e", emoji: "⭐" },
  { id: 11, name: "Star Spinner",   number: 8822,   price: 15, type: "Звезда",    skin: "Призма",     bg: "Туман",     bgGradient: "linear-gradient(145deg,#1e1e3e,#2e2e5e)", accentColor: "#f2e24e", emoji: "⭐" },
  { id: 12, name: "Diamond Ring",   number: 1923,   price: 25, type: "Кольцо",    skin: "Бриллиант",  bg: "Лёд",       bgGradient: "linear-gradient(145deg,#0d2e3e,#0d4a5a)", accentColor: "#4ef2f2", emoji: "💍" },
  { id: 13, name: "Cozy Candle",    number: 44321,  price: 4,  type: "Свеча",     skin: "Уют",        bg: "Тепло",     bgGradient: "linear-gradient(145deg,#3e1a0d,#6a2a1a)", accentColor: "#f2844e", emoji: "🕯️" },
  { id: 14, name: "Cozy Candle",    number: 44400,  price: 4,  type: "Свеча",     skin: "Уют",        bg: "Тепло",     bgGradient: "linear-gradient(145deg,#3e2a0d,#6a4a1a)", accentColor: "#f2b44e", emoji: "🕯️" },
  { id: 15, name: "Golden Star",    number: 3321,   price: 20, type: "Звезда",    skin: "Золото",     bg: "Роскошь",   bgGradient: "linear-gradient(145deg,#3e2a00,#6a4a00)", accentColor: "#f2c84e", emoji: "🌟" },
  { id: 16, name: "Lunar Snake",    number: 205111, price: 5,  type: "Змея",      skin: "Лунный",     bg: "Фиолет",    bgGradient: "linear-gradient(145deg,#1e0d4b,#3d1a7a)", accentColor: "#9b4ef2", emoji: "🐍" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function getUnique(arr: GiftItem[], key: keyof GiftItem): string[] {
  return [...new Set(arr.map((g) => String(g[key])))].sort();
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function TonIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none">
      <circle cx="28" cy="28" r="28" fill="#0098EA" />
      <path
        d="M37.58 15.4H18.42c-3.49 0-5.67 3.79-3.92 6.79l11.5 19.52c.87 1.5 2.97 1.5 3.84 0l11.5-19.52c1.75-3-.43-6.79-3.84-6.79Z"
        fill="white"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="7.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ChevronDown({ size = 10 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 8" fill="none">
      <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Filter Dropdown ───────────────────────────────────────────────────────────

interface FilterDropdownProps {
  options: string[];
  selected: string | null;
  onSelect: (v: string | null) => void;
  onClose: () => void;
}

function FilterDropdown({ options, selected, onSelect, onClose }: FilterDropdownProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute top-full left-0 mt-1.5 z-50 rounded-2xl overflow-hidden animate-scale-in"
      style={{
        background: "rgba(20,20,32,0.98)",
        border: "1px solid rgba(255,255,255,0.1)",
        minWidth: 140,
        boxShadow: "0 12px 32px rgba(0,0,0,0.6)",
      }}
    >
      <button
        onClick={() => { onSelect(null); onClose(); }}
        className="w-full text-left px-4 py-2.5 text-sm transition-colors"
        style={{ color: selected === null ? "var(--accent)" : "rgba(255,255,255,0.5)" }}
      >
        Все
      </button>
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => { onSelect(opt); onClose(); }}
          className="w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-white/5"
          style={{ color: selected === opt ? "var(--accent)" : "rgba(255,255,255,0.75)" }}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

// ── Gift Card ─────────────────────────────────────────────────────────────────

interface GiftCardProps {
  gift: GiftItem;
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
      {/* Image area */}
      <div
        className="relative flex items-center justify-center"
        style={{
          background: gift.bgGradient,
          aspectRatio: "1 / 1",
        }}
      >
        {/* Glow */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(circle at 50% 60%, ${gift.accentColor}66, transparent 70%)`,
          }}
        />
        {/* Stars decoration */}
        <div className="absolute top-2 right-2.5 text-[8px] opacity-50">✦</div>
        <div className="absolute top-4 left-3 text-[6px] opacity-35">✦</div>
        <div className="absolute bottom-3 right-3 text-[5px] opacity-40">✦</div>

        {/* Emoji */}
        <span className="relative z-10 select-none" style={{ fontSize: 36 }}>
          {gift.emoji}
        </span>
      </div>

      {/* Info */}
      <div className="px-2.5 pt-2 pb-2.5 flex flex-col gap-1">
        <p className="text-[12px] font-semibold text-white leading-tight truncate">{gift.name}</p>
        <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>
          #{gift.number.toLocaleString()}
        </p>

        {/* Price + Add */}
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-1">
            <TonIcon size={13} />
            <span className="text-[12px] font-bold text-white">{gift.price}</span>
          </div>
          <button
            onClick={onAdd}
            className="w-6 h-6 rounded-full flex items-center justify-center transition-all active:scale-90"
            style={{
              background: inCart ? "rgba(0,136,204,0.25)" : "var(--accent)",
              color: "#fff",
              fontSize: 16,
              lineHeight: 1,
            }}
          >
            {inCart ? "✓" : "+"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ══ ShopPage ══════════════════════════════════════════════════════════════════

export function ShopPage() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<"type" | "skin" | "bg" | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedSkin, setSelectedSkin] = useState<string | null>(null);
  const [selectedBg, setSelectedBg] = useState<string | null>(null);
  const [cart, setCart] = useState<Set<number>>(new Set());

  const types = useMemo(() => getUnique(GIFTS, "type"), []);
  const skins = useMemo(() => getUnique(GIFTS, "skin"), []);
  const bgs   = useMemo(() => getUnique(GIFTS, "bg"),   []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return GIFTS.filter((g) => {
      const matchSearch =
        g.name.toLowerCase().includes(q) || String(g.number).includes(q);
      const matchType = !selectedType || g.type === selectedType;
      const matchSkin = !selectedSkin || g.skin === selectedSkin;
      const matchBg   = !selectedBg   || g.bg   === selectedBg;
      return matchSearch && matchType && matchSkin && matchBg;
    });
  }, [search, selectedType, selectedSkin, selectedBg]);

  function toggleCart(id: number) {
    setCart((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const cartCount = cart.size;

  // Filter chip helper
  function FilterChip({
    label,
    key,
    selected,
  }: {
    label: string;
    key: "type" | "skin" | "bg";
    selected: string | null;
  }) {
    const isOpen = activeFilter === key;
    const isActive = selected !== null;
    const options = key === "type" ? types : key === "skin" ? skins : bgs;

    return (
      <div className="relative">
        <button
          onClick={() => setActiveFilter(isOpen ? null : key)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
          style={{
            background: isActive
              ? "rgba(0,136,204,0.2)"
              : "rgba(255,255,255,0.06)",
            border: `1px solid ${isActive ? "rgba(0,136,204,0.4)" : "rgba(255,255,255,0.08)"}`,
            color: isActive ? "var(--accent)" : "rgba(255,255,255,0.55)",
          }}
        >
          {label}
          {isActive && (
            <span
              className="rounded-full text-[9px] px-1 font-bold"
              style={{ background: "var(--accent)", color: "#fff" }}
            >
              1
            </span>
          )}
          <ChevronDown />
        </button>

        {isOpen && (
          <FilterDropdown
            options={options}
            selected={selected}
            onSelect={
              key === "type"
                ? setSelectedType
                : key === "skin"
                ? setSelectedSkin
                : setSelectedBg
            }
            onClose={() => setActiveFilter(null)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-28" style={{ background: "var(--bg)" }}>

      {/* Header */}
      <div className="relative px-4 pt-10 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">Магазин</h1>
            <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
              Подарки Telegram
            </p>
          </div>

          {/* Cart badge */}
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
              <span className="text-sm font-bold" style={{ color: "var(--accent)" }}>
                {cartCount}
              </span>
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
            placeholder="Поиск Гифта"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/25"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-white/30 text-lg leading-none"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Filter chips */}
      <div className="px-4 mb-4 flex items-center gap-2">
        <FilterChip label="Тип"  key="type" selected={selectedType} />
        <FilterChip label="Скин" key="skin" selected={selectedSkin} />
        <FilterChip label="Фон"  key="bg"   selected={selectedBg} />

        {/* Clear filters */}
        {(selectedType || selectedSkin || selectedBg) && (
          <button
            onClick={() => {
              setSelectedType(null);
              setSelectedSkin(null);
              setSelectedBg(null);
            }}
            className="text-[11px] px-2.5 py-1.5 rounded-full transition-opacity"
            style={{
              color: "rgba(255,255,255,0.35)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            Сбросить
          </button>
        )}
      </div>

      {/* Count */}
      <div className="px-4 mb-3">
        <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.25)" }}>
          {filtered.length} подарков
        </p>
      </div>

      {/* Gift grid */}
      {filtered.length > 0 ? (
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
