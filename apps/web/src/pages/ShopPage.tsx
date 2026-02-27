import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { useTonConnectUI } from "@tonconnect/ui-react";
import { api } from "@/api/client";
import type { UniqueGiftItem } from "@roulette/shared";

// ── Backdrop color map ────────────────────────────────────────────────────────
// Maps Telegram gift "Backdrop" attribute value → card background color.
// Unknown values fall back to hashColor() which generates a deterministic
// dark colour from the attribute string so every backdrop gets a swatch.

const BACKDROP_COLORS: Record<string, string> = {
  // ── Greens / Teals ──────────────────────────────────────────────────────
  "Green":              "#2A6040",
  "Jade Green":         "#2E7D6A",
  "Forest Green":       "#2D5A30",
  "Dark Green":         "#1E4A28",
  "Mint":               "#2E8A6A",
  "Mint Green":         "#2A7A60",
  "Teal":               "#2A7A80",
  "Dark Teal":          "#1E5A62",
  "Emerald":            "#2A7A5A",
  "Olive":              "#4E6030",
  "Sage":               "#4E6A45",
  "Lime":               "#4A7020",
  "Pistachio":          "#5A7038",
  // ── Purples / Violets ───────────────────────────────────────────────────
  "Purple":             "#5C3D8F",
  "Dark Purple":        "#3A1A6A",
  "Violet":             "#5A3A8A",
  "Dark Violet":        "#3A2070",
  "Lavender":           "#6A508A",
  "Royal Purple":       "#4A2A7A",
  "Mauve":              "#7A4A80",
  "Plum":               "#6A3070",
  "Amethyst":           "#6A3A8A",
  "Lilac":              "#7A5A90",
  "Orchid":             "#7A3A80",
  "Grape":              "#5A2A70",
  // ── Blues ───────────────────────────────────────────────────────────────
  "Blue":               "#2A4A8A",
  "Dark Blue":          "#1A2E6A",
  "Navy":               "#1A2E6A",
  "Royal Blue":         "#2A3A90",
  "Sky":                "#2A6A9A",
  "Sky Blue":           "#2A6A9A",
  "Cobalt":             "#2A3A8A",
  "Indigo":             "#3A2A8A",
  "Steel Blue":         "#3A5A80",
  "Ice Blue":           "#2A5A8A",
  "Sapphire":           "#1A3A80",
  "Azure":              "#2060A0",
  "Cerulean":           "#2A5A90",
  "Denim":              "#2A3A70",
  "Ocean":              "#1A4A7A",
  "Aqua":               "#1A6A80",
  "Aquamarine":         "#1A7A7A",
  "Powder Blue":        "#3A5A80",
  // ── Reds / Pinks ────────────────────────────────────────────────────────
  "Red":                "#8A2A2A",
  "Dark Red":           "#6A1A1A",
  "Crimson":            "#7A1A1A",
  "Crimson Red":        "#7A1A1A",
  "Ruby":               "#8A1A2A",
  "Scarlet":            "#8A2020",
  "Maroon":             "#6A1A20",
  "Burgundy":           "#6A1A2A",
  "Wine":               "#6A1A30",
  "Garnet":             "#7A1A28",
  "Cherry":             "#7A1A30",
  "Rose":               "#8A3A50",
  "Dark Rose":          "#6A2040",
  "Pink":               "#8A3A6A",
  "Hot Pink":           "#8A2A5A",
  "Deep Pink":          "#7A1A50",
  "Magenta":            "#7A2A7A",
  "Fuchsia":            "#8A1A7A",
  "Raspberry":          "#8A2A50",
  "Salmon":             "#8A4A3A",
  "Blush":              "#8A4A58",
  "Flamingo":           "#8A3A5A",
  "Rose Gold":          "#7A4A4A",
  // ── Oranges / Yellows / Golds ───────────────────────────────────────────
  "Orange":             "#8A4E1A",
  "Dark Orange":        "#7A3A10",
  "Amber":              "#8A6A1A",
  "Gold":               "#8A6A10",
  "Golden":             "#8A6A10",
  "Dark Gold":          "#6A5010",
  "Yellow":             "#7A7A10",
  "Mustard":            "#7A6010",
  "Bronze":             "#7A5A1A",
  "Copper":             "#7A4A1A",
  "Topaz":              "#8A7020",
  "Saffron":            "#8A6A00",
  "Honey":              "#8A6A18",
  "Caramel":            "#7A5020",
  "Peach":              "#8A5A3A",
  "Coral":              "#8A4A3A",
  "Tangerine":          "#8A4810",
  "Pumpkin":            "#7A4010",
  // ── Neutrals / Metallics ────────────────────────────────────────────────
  "Silver":             "#4A4A5A",
  "Platinum":           "#4A4A60",
  "Charcoal":           "#2A2A3A",
  "Black":              "#1A1A2A",
  "White":              "#4A4A5E",
  "Ivory":              "#5A5040",
  "Cream":              "#5A5038",
  "Brown":              "#5A3E22",
  "Dark Brown":         "#3A2810",
  "Chocolate":          "#4A2C14",
  "Mahogany":           "#5A2A1A",
  "Beige":              "#5A4E38",
  "Tan":                "#5E4828",
  "Khaki":              "#5A5030",
  "Slate":              "#3A4050",
  "Ash":                "#3A3A48",
  "Steel":              "#3A4452",
  "Graphite":           "#2A2E38",
  "Iron":               "#2A2A35",
  "Onyx":               "#1E1E2A",
  "Obsidian":           "#1A1A28",
  "Diamond":            "#3A4A5A",
  "Pearl":              "#4A4A58",
  "Opal":               "#3A4860",
  // ── Others ──────────────────────────────────────────────────────────────
  "Cyan":               "#1A7A8A",
  "Turquoise":          "#1A7A6A",
  "Jade":               "#2A7A6A",
  "Neon Green":         "#1E6030",
  "Neon Blue":          "#1A2A8A",
  "Electric Blue":      "#1A2A90",
  "Electric Purple":    "#4A1A8A",
  "Midnight":           "#1A1A3A",
  "Midnight Blue":      "#1A1A4A",
  "Space":              "#1A1A30",
  "Galaxy":             "#2A1A40",
  "Cosmic":             "#2A1A3A",
  "Nebula":             "#3A1A50",
  "Aurora":             "#2A5A4A",
  "Prism":              "#2A3A6A",
  "Rainbow":            "#3A2A6A",
  "Holographic":        "#2A3A5A",
  "Neon":               "#1A5A3A",
  "Candy":              "#6A2A5A",
  "Peppermint":         "#2A6A50",
  "Winterfrost":        "#2A4A6A",
  "Frosty":             "#2A4A6A",
  "Ice":                "#2A4A6A",
  "Arctic":             "#2A4A72",
  "Arctic Blue":        "#2A4A72",
  "Sakura":             "#8A3A5A",
  "Blossom":            "#7A3A52",
  "Spring":             "#4A6A30",
  "Summer":             "#7A6020",
  "Autumn":             "#7A4020",
  "Winter":             "#2A3A6A",
  "Tropical":           "#1A6A4A",
  "Forest":             "#2A5030",
  "Jungle":             "#1E4A28",
  "Desert":             "#7A5A2A",
  "Sunset":             "#7A4020",
  "Sunrise":            "#7A4828",
  "Dusk":               "#4A2A5A",
  "Dawn":               "#5A3A4A",
  "Night":              "#1A1A2A",
  "Shadow":             "#1E1E2E",
  "Storm":              "#2A2A4A",
  "Thunder":            "#2A2840",
  "Lava":               "#7A2A10",
  "Fire":               "#8A3010",
  "Flame":              "#8A3818",
  "Smoke":              "#2E2E3A",
  "Ash Gray":           "#3A3A48",
  "Warm Gray":          "#3E3828",
  "Cool Gray":          "#3A3A50",
  "Mist":               "#3A4050",
  "Fog":                "#3A3E4A",
  "Cloud":              "#4A4A5A",
  "Sand":               "#6A5A30",
  "Earth":              "#5A4220",
  "Clay":               "#6A3E28",
  "Rust":               "#7A3818",
  "Brick":              "#7A3420",
  "Stone":              "#3A3A42",
  "Marble":             "#4A4A58",
  "Granite":            "#3A3840",
  "Crystal":            "#2A4A6A",
  "Glass":              "#3A4862",
  "Glitter":            "#4A4A68",
};

// Deterministic dark colour generated from any string (fallback for unknown backdrops)
function hashColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash |= 0;
  }
  const hue = Math.abs(hash) % 360;
  // Vary saturation and lightness slightly for visual diversity
  const sat = 40 + (Math.abs(hash >> 8) % 25);
  const lit = 22 + (Math.abs(hash >> 16) % 12);
  return `hsl(${hue},${sat}%,${lit}%)`;
}

function getBackdropColor(gift: UniqueGiftItem): string {
  const backdrop = gift.attributes.find(
    (a) => a.trait_type.toLowerCase() === "backdrop"
  )?.value ?? "";
  return BACKDROP_COLORS[backdrop] ?? (backdrop ? hashColor(backdrop) : "#252535");
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function TonIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none">
      <path d="M28 0C43.464 0 56 12.536 56 28C56 43.464 43.464 56 28 56C12.536 56 0 43.464 0 28C0 12.536 12.536 0 28 0Z" fill="#0098EA" />
      <path d="M37.56 15.63H18.44c-3.52 0-5.74 3.75-3.98 6.81L26.25 42.97a2 2 0 003.51 0l11.78-20.53c1.76-3.06-.46-6.81-3.98-6.81z" fill="white" />
      <path d="M28.89 35.6l6.71-12.12a.33.33 0 00-.29-.5H20.77a.33.33 0 00-.29.5L27.11 35.6c.16.29.62.29 1.78 0z" fill="#0098EA" />
    </svg>
  );
}

function TonIconMini({ size = 13 }: { size?: number }) {
  // Just the diamond outline version for use without circle background
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none">
      <path d="M37.56 3H18.44C14.92 3 12.7 6.75 14.46 9.81L26.25 30.97a2 2 0 003.51 0L41.54 9.81C43.3 6.75 41.08 3 37.56 3z" fill="currentColor" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="7.5" stroke="currentColor" strokeWidth="2" />
      <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function SortIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l4-4 4 4M7 5v14M21 15l-4 4-4-4M17 19V5" />
    </svg>
  );
}

function ChevronDownIcon({ size = 10 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 109-9 9 9 0 00-9 8.72" />
      <polyline points="12 7 12 12 15 15" />
      <path d="M3.05 11H7" />
      <polyline points="3 7 3 11 7 11" />
    </svg>
  );
}

function CopyIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  );
}

function ShareIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  );
}

function CartIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
    </svg>
  );
}

// ── Checkbox icon ─────────────────────────────────────────────────────────────

function CheckboxIcon({ checked }: { checked: boolean }) {
  return (
    <div style={{
      width: 22,
      height: 22,
      borderRadius: 6,
      border: checked ? "none" : "1.5px solid rgba(255,255,255,0.2)",
      background: checked ? "#4a6cf7" : "transparent",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      transition: "all 0.15s",
    }}>
      {checked && (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  );
}

// ── Filter bottom sheet ───────────────────────────────────────────────────────

interface FilterDropdownProps {
  label: string;
  options: string[];
  value: string | null;
  onChange: (v: string | null) => void;
  thumbnails?: Record<string, string | null>;
}

function FilterDropdown({ label, options, value, onChange, thumbnails }: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<string | null>(value);

  // Sync pending when sheet opens
  function openSheet() {
    setPending(value);
    setOpen(true);
  }

  function confirm() {
    onChange(pending);
    setOpen(false);
  }

  function close() {
    setOpen(false);
  }

  const isActive = value !== null;

  const sheet = open && createPortal(
    <div
      onClick={close}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(3px)",
        display: "flex",
        alignItems: "flex-end",
      }}
    >
      {/* Bottom sheet */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          background: "#1a1a2e",
          borderRadius: "20px 20px 0 0",
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          animation: "slideUp 0.25s cubic-bezier(0.32,0.72,0,1)",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px 16px 12px",
          position: "relative",
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>{label}</span>
          <button
            onClick={close}
            style={{
              position: "absolute",
              right: 16,
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.1)",
              border: "none",
              color: "rgba(255,255,255,0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: 18,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "rgba(255,255,255,0.06)", flexShrink: 0 }} />

        {/* List */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {/* Select all — no icon */}
          <button
            onClick={() => setPending(null)}
            style={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              padding: "16px 20px",
              background: "transparent",
              border: "none",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              cursor: "pointer",
              gap: 12,
            }}
          >
            <span style={{ flex: 1, fontSize: 16, fontWeight: 500, color: "#fff", textAlign: "left" }}>
              Выбрать все
            </span>
            <CheckboxIcon checked={pending === null} />
          </button>

          {/* Options */}
          {options.map((opt) => {
            const thumb = thumbnails?.[opt] ?? null;
            // If thumb starts with '#' it's a color code — render color square
            const isColor = thumb?.startsWith("#");
            return (
              <button
                key={opt}
                onClick={() => setPending(opt)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                  padding: "12px 20px",
                  background: "transparent",
                  border: "none",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                  cursor: "pointer",
                  gap: 14,
                }}
              >
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: isColor ? (thumb as string) : "rgba(255,255,255,0.06)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  overflow: "hidden",
                }}>
                  {!isColor && (
                    thumb
                      ? <img src={thumb} alt={opt} style={{ width: 38, height: 38, objectFit: "contain" }} />
                      : <span style={{ fontSize: 22 }}>🎁</span>
                  )}
                </div>
                <span style={{ flex: 1, fontSize: 16, fontWeight: 500, color: "#fff", textAlign: "left", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {opt}
                </span>
                <CheckboxIcon checked={pending === opt} />
              </button>
            );
          })}
        </div>

        {/* Confirm button */}
        <div style={{ padding: "12px 16px", flexShrink: 0, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <button
            onClick={confirm}
            style={{
              width: "100%",
              height: 52,
              borderRadius: 14,
              border: "none",
              background: "#fff",
              color: "#1a1a2e",
              fontSize: 16,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Подтвердить
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
      `}</style>
    </div>,
    document.body
  );

  return (
    <>
      <button
        onClick={openSheet}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          padding: "7px 13px",
          borderRadius: 20,
          fontSize: 13,
          fontWeight: 600,
          border: "none",
          background: isActive ? "#4a6cf7" : "#2a2a3e",
          color: isActive ? "#fff" : "rgba(255,255,255,0.7)",
          cursor: "pointer",
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >
        {value ?? label}
        <ChevronDownIcon size={10} />
      </button>
      {sheet}
    </>
  );
}

// ── Gift card ─────────────────────────────────────────────────────────────────

interface GiftCardProps {
  gift: UniqueGiftItem;
  onOpen: () => void;
}

function GiftCard({ gift, onOpen }: GiftCardProps) {
  const [imgError, setImgError] = useState(false);

  const match = gift.name.match(/#(\d+)$/);
  const itemNumber = match ? `#${match[1]}` : null;
  const baseName = itemNumber ? gift.name.replace(/#\d+$/, "").trim() : gift.name;

  const priceLabel =
    gift.priceTon % 1 === 0
      ? `${gift.priceTon}`
      : `${gift.priceTon.toFixed(2)}`;

  const bgColor = getBackdropColor(gift);

  return (
    <div
      onClick={onOpen}
      style={{
        borderRadius: 16,
        overflow: "hidden",
        cursor: "pointer",
        background: "#0d0d14",
        border: "1px solid rgba(255,255,255,0.07)",
        display: "flex",
        flexDirection: "column",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {/* Image area */}
      <div
        style={{
          position: "relative",
          aspectRatio: "1 / 1",
          background: "#0d0d14",
          overflow: "hidden",
        }}
      >
        {gift.thumbnailUrl && !imgError ? (
          <img
            src={gift.thumbnailUrl}
            alt={gift.name}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            onError={() => setImgError(true)}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 48 }}>🎁</span>
          </div>
        )}

        {/* "+" quick-add button */}
        <button
          onClick={(e) => { e.stopPropagation(); onOpen(); }}
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            width: 28,
            height: 28,
            borderRadius: 10,
            background: "rgba(255,255,255,0.18)",
            backdropFilter: "blur(8px)",
            border: "none",
            color: "#fff",
            fontSize: 18,
            lineHeight: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontWeight: 300,
          }}
        >
          +
        </button>
      </div>

      {/* Info */}
      <div style={{ padding: "8px 8px 8px", display: "flex", flexDirection: "column", gap: 1 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: "#fff", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {baseName}
        </p>
        {itemNumber && (
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", margin: 0 }}>
            {itemNumber}
          </p>
        )}

        {/* TON buy button — opens detail modal */}
        <button
          onClick={(e) => { e.stopPropagation(); onOpen(); }}
          style={{
            marginTop: 6,
            width: "100%",
            height: 30,
            borderRadius: 9,
            border: "none",
            background: "#0098EA",
            color: "#fff",
            fontSize: 11,
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
          }}
        >
          <TonIconMini size={10} />
          {priceLabel} TON
        </button>
      </div>
    </div>
  );
}

// ── Skeleton card ─────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div
      className="animate-pulse"
      style={{
        borderRadius: 16,
        overflow: "hidden",
        background: "#0d0d14",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div style={{ aspectRatio: "1/1", background: "#161620" }} />
      <div style={{ padding: "10px", display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ height: 12, borderRadius: 6, width: "70%", background: "rgba(255,255,255,0.08)" }} />
        <div style={{ height: 10, borderRadius: 6, width: "40%", background: "rgba(255,255,255,0.05)" }} />
        <div style={{ height: 34, borderRadius: 10, background: "rgba(0,152,234,0.25)", marginTop: 2 }} />
      </div>
    </div>
  );
}

// ── Gift detail modal ─────────────────────────────────────────────────────────

interface GiftDetailModalProps {
  gift: UniqueGiftItem;
  rarityMap: Map<string, number>;
  onClose: () => void;
}

function GiftDetailModal({ gift, rarityMap, onClose }: GiftDetailModalProps) {
  const [imgError, setImgError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [buying, setBuying] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [tonConnectUI] = useTonConnectUI();

  const priceLabel =
    gift.priceTon % 1 === 0
      ? `${gift.priceTon}`
      : `${gift.priceTon.toFixed(2)}`;

  const bgColor = getBackdropColor(gift);

  async function handleBuy() {
    if (!gift.saleAddress || !gift.priceNano) return;
    setBuying(true);
    try {
      // Price + 0.05 TON for marketplace gas/fees
      const totalNano = (BigInt(gift.priceNano) + BigInt(50_000_000)).toString();
      await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [{ address: gift.saleAddress, amount: totalNano }],
      });
    } catch {
      // user cancelled or error — do nothing
    } finally {
      setBuying(false);
    }
  }

  function copyName() {
    navigator.clipboard.writeText(gift.name).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === overlayRef.current) onClose();
  }

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    tg?.BackButton?.show();
    tg?.BackButton?.onClick(onClose);
    return () => {
      tg?.BackButton?.offClick(onClose);
      tg?.BackButton?.hide();
    };
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        background: "rgba(9,9,15,0.92)",
        display: "flex",
        alignItems: "flex-end",
      }}
    >
      <div
        style={{
          width: "100%",
          background: "#1c1c1e",
          borderRadius: "20px 20px 0 0",
          paddingBottom: "env(safe-area-inset-bottom, 16px)",
          maxHeight: "92vh",
          overflowY: "auto",
          animation: "slideUp 0.28s cubic-bezier(0.32, 0.72, 0, 1)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "14px 16px 10px", position: "relative" }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>Гифт</span>
          <div style={{ position: "absolute", right: 16, display: "flex", gap: 8 }}>
            <button
              onClick={() => {
                const tg = (window as any).Telegram?.WebApp;
                if (tg?.openLink) tg.openLink(gift.getgemsUrl);
                else window.open(gift.getgemsUrl, "_blank", "noopener,noreferrer");
              }}
              title="Открыть на GetGems"
              style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(255,255,255,0.08)", border: "none", color: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
            >
              <ShareIcon size={15} />
            </button>
            <button
              onClick={onClose}
              style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(255,255,255,0.08)", border: "none", color: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 20, lineHeight: 1 }}
            >
              ×
            </button>
          </div>
        </div>

        {/* Image */}
        <div style={{ padding: "0 16px 14px" }}>
          <div
            style={{
              borderRadius: 16,
              overflow: "hidden",
              background: "#0d0d14",
              aspectRatio: "1 / 1",
            }}
          >
            {gift.thumbnailUrl && !imgError ? (
              <img
                src={gift.thumbnailUrl}
                alt={gift.name}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                onError={() => setImgError(true)}
              />
            ) : (
              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 72 }}>🎁</span>
              </div>
            )}
          </div>
        </div>

        {/* Name + price */}
        <div style={{ padding: "0 16px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <button
            onClick={copyName}
            style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", padding: 0, minWidth: 0 }}
          >
            <span style={{ fontSize: 17, fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {gift.name}
            </span>
            <span style={{ color: copied ? "#4cd964" : "rgba(255,255,255,0.35)", flexShrink: 0 }}>
              <CopyIcon size={14} />
            </span>
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0, background: "rgba(0,152,234,0.15)", borderRadius: 10, padding: "5px 10px" }}>
            <TonIcon size={15} />
            <span style={{ fontSize: 15, fontWeight: 700, color: "#0098EA" }}>{priceLabel}</span>
          </div>
        </div>

        {/* Attributes */}
        {gift.attributes.length > 0 && (
          <div style={{ padding: "0 16px 16px" }}>
            <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 14, overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)" }}>
              {gift.attributes.map((attr, i) => {
                const key = `${attr.trait_type}:${attr.value}`;
                const rarity = rarityMap.get(key);
                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "11px 14px",
                      borderBottom: i < gift.attributes.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
                    }}
                  >
                    <span style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}>{attr.trait_type}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{attr.value}</span>
                      {rarity !== undefined && (
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#4cd964" }}>
                          {rarity < 1 ? rarity.toFixed(1) : Math.round(rarity)}%
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Buttons */}
        <div style={{ padding: "0 16px 16px", display: "flex", gap: 10 }}>
          <button
            onClick={handleBuy}
            disabled={buying || !gift.saleAddress}
            style={{
              flex: 1, height: 50, borderRadius: 14, border: "none",
              background: buying ? "rgba(0,152,234,0.4)" : "#0098EA",
              color: "#fff", fontSize: 15, fontWeight: 700, cursor: buying ? "default" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
              opacity: !gift.saleAddress ? 0.5 : 1,
              transition: "background 0.15s",
            }}
          >
            <TonIcon size={18} />
            {buying ? "Ожидание…" : `${priceLabel} TON`}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ══ ShopPage ══════════════════════════════════════════════════════════════════

export function ShopPage() {
  const [gifts, setGifts] = useState<UniqueGiftItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortAsc, setSortAsc] = useState(true);

  // Dropdown filters
  const [filterType, setFilterType] = useState<string | null>(null);     // collection
  const [filterSkin, setFilterSkin] = useState<string | null>(null);     // Model attr
  const [filterBackdrop, setFilterBackdrop] = useState<string | null>(null); // Backdrop attr

  const [selectedGift, setSelectedGift] = useState<UniqueGiftItem | null>(null);

  useEffect(() => {
    api
      .get<UniqueGiftItem[]>("/shop/unique-gifts")
      .then(setGifts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Collect filter options from all gifts
  const typeOptions = useMemo(() => {
    const s = new Set<string>();
    for (const g of gifts) s.add(g.collectionName);
    return [...s].sort();
  }, [gifts]);

  const skinOptions = useMemo(() => {
    const s = new Set<string>();
    for (const g of gifts) {
      const model = g.attributes.find((a) => a.trait_type.toLowerCase() === "model")?.value;
      if (model) s.add(model);
    }
    return [...s].sort();
  }, [gifts]);

  const backdropOptions = useMemo(() => {
    const s = new Set<string>();
    for (const g of gifts) {
      const bd = g.attributes.find((a) => a.trait_type.toLowerCase() === "backdrop")?.value;
      if (bd) s.add(bd);
    }
    return [...s].sort();
  }, [gifts]);

  const filtered = useMemo(() => {
    let result = gifts;
    if (filterType) result = result.filter((g) => g.collectionName === filterType);
    if (filterSkin) {
      result = result.filter((g) =>
        g.attributes.some((a) => a.trait_type.toLowerCase() === "model" && a.value === filterSkin)
      );
    }
    if (filterBackdrop) {
      result = result.filter((g) =>
        g.attributes.some((a) => a.trait_type.toLowerCase() === "backdrop" && a.value === filterBackdrop)
      );
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (g) => g.name.toLowerCase().includes(q) || g.collectionName.toLowerCase().includes(q)
      );
    }
    const sorted = [...result].sort((a, b) =>
      sortAsc ? a.priceTon - b.priceTon : b.priceTon - a.priceTon
    );
    return sorted;
  }, [gifts, filterType, filterSkin, filterBackdrop, search, sortAsc]);

  // Rarity within same collection
  const rarityMap = useMemo(() => {
    if (!selectedGift) return new Map<string, number>();
    const collectionItems = gifts.filter((g) => g.collectionName === selectedGift.collectionName);
    const total = collectionItems.length;
    if (total === 0) return new Map<string, number>();
    const counts = new Map<string, number>();
    for (const item of collectionItems) {
      for (const attr of item.attributes) {
        const key = `${attr.trait_type}:${attr.value}`;
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
    }
    const result = new Map<string, number>();
    counts.forEach((count, key) => result.set(key, (count / total) * 100));
    return result;
  }, [gifts, selectedGift]);

  const closeModal = useCallback(() => setSelectedGift(null), []);

  const hasActiveFilter = filterType !== null || filterSkin !== null || filterBackdrop !== null;

  // First thumbnail per collection / skin / backdrop for filter sheets
  const typeThumbnails = useMemo<Record<string, string | null>>(() => {
    const map: Record<string, string | null> = {};
    for (const g of gifts) {
      if (!(g.collectionName in map)) map[g.collectionName] = g.thumbnailUrl;
    }
    return map;
  }, [gifts]);

  const skinThumbnails = useMemo<Record<string, string | null>>(() => {
    const map: Record<string, string | null> = {};
    for (const g of gifts) {
      const skin = g.attributes.find((a) => a.trait_type.toLowerCase() === "model")?.value;
      if (skin && !(skin in map)) map[skin] = g.thumbnailUrl;
    }
    return map;
  }, [gifts]);

  const backdropThumbnails = useMemo<Record<string, string | null>>(() => {
    const map: Record<string, string | null> = {};
    for (const g of gifts) {
      const bd = g.attributes.find((a) => a.trait_type.toLowerCase() === "backdrop")?.value;
      if (bd && !(bd in map)) {
        // Always produce a colour string so FilterDropdown renders a colour square.
        // hashColor() handles any backdrop value not in the static map.
        map[bd] = BACKDROP_COLORS[bd] ?? hashColor(bd);
      }
    }
    return map;
  }, [gifts]);

  return (
    <div style={{ minHeight: "100vh", paddingBottom: 96, background: "var(--bg)" }}>

      {/* ── Top bar ── */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 30,
          background: "#12121f",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
          padding: "env(safe-area-inset-top, 0px) 0 0",
        }}
      >
        {/* Search row */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px 8px" }}>
          {/* Search input */}
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "9px 14px",
              borderRadius: 20,
              background: "#2a2a3e",
              border: "none",
              minWidth: 0,
            }}
          >
            <span style={{ color: "rgba(255,255,255,0.3)", display: "flex", flexShrink: 0 }}><SearchIcon /></span>
            <input
              type="text"
              placeholder="Поиск Гифта"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 14, color: "#fff", minWidth: 0 }}
            />
            {search && (
              <button onClick={() => setSearch("")} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", fontSize: 18, lineHeight: 1, cursor: "pointer", padding: 0, flexShrink: 0 }}>×</button>
            )}
          </div>

          {/* TON balance badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "7px 10px", borderRadius: 20, background: "#2a2a3e", flexShrink: 0 }}>
            <TonIcon size={14} />
            <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>0</span>
          </div>

          {/* + button */}
          <button style={{ width: 34, height: 34, borderRadius: "50%", background: "#2a2a3e", border: "none", color: "rgba(255,255,255,0.7)", fontSize: 20, lineHeight: "1", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontWeight: 300, flexShrink: 0, padding: 0 }}>
            +
          </button>

          {/* History button */}
          <button style={{ width: 34, height: 34, borderRadius: 12, background: "#2a2a3e", border: "none", color: "rgba(255,255,255,0.5)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
            <HistoryIcon />
          </button>
        </div>

        {/* Filter row */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 12px 10px", overflowX: "auto", scrollbarWidth: "none" }}>
          {/* Sort toggle */}
          <button
            onClick={() => setSortAsc((v) => !v)}
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: "#2a2a3e",
              border: "none",
              color: "rgba(255,255,255,0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0,
              padding: 0,
            }}
          >
            <SortIcon />
          </button>

          <FilterDropdown label="Тип" options={typeOptions} value={filterType} onChange={setFilterType} thumbnails={typeThumbnails} />
          <FilterDropdown label="Скин" options={skinOptions} value={filterSkin} onChange={setFilterSkin} thumbnails={skinThumbnails} />
          <FilterDropdown label="Фон" options={backdropOptions} value={filterBackdrop} onChange={setFilterBackdrop} thumbnails={backdropThumbnails} />

          {hasActiveFilter && (
            <button
              onClick={() => { setFilterType(null); setFilterSkin(null); setFilterBackdrop(null); }}
              style={{ padding: "6px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: "rgba(255,80,80,0.12)", border: "1px solid rgba(255,80,80,0.25)", color: "#ff6060", cursor: "pointer", flexShrink: 0 }}
            >
              Сбросить
            </button>
          )}
        </div>
      </div>

      {/* Count */}
      <div style={{ padding: "10px 14px 6px" }}>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", margin: 0 }}>
          {loading ? "Загрузка…" : `${filtered.length} лотов`}
        </p>
      </div>

      {/* ── Grid ── */}
      <div style={{ padding: "0 12px" }}>
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            {Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            {filtered.map((gift, i) => (
              <div
                key={gift.address}
                className="animate-fade-up"
                style={{ animationDelay: `${Math.min(i * 0.04, 0.5)}s` }}
              >
                <GiftCard gift={gift} onOpen={() => setSelectedGift(gift)} />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, paddingTop: 80 }}>
            <span style={{ fontSize: 48, opacity: 0.2 }}>🔍</span>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.3)", margin: 0 }}>Ничего не найдено</p>
          </div>
        )}
      </div>

      {/* ── Detail modal ── */}
      {selectedGift && (
        <GiftDetailModal
          gift={selectedGift}
          rarityMap={rarityMap}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
