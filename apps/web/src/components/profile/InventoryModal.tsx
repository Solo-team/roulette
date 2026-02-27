import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTgBack } from "@/hooks/useTgBack";
import { StackIcon, GiftBoxIcon, MagnifyingGlassIcon, StarIcon } from "@/components/ui/icons";
import { api } from "@/api/client";
import type { GiftInventoryItem } from "@roulette/shared";

function BackArrow() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 5l-7 7 7 7" />
    </svg>
  );
}

interface InventoryModalProps {
  onClose: () => void;
}

const TRANSFER_BOT = "@mvop181";

function ChevronRight() {
  return (
    <svg width="7" height="12" viewBox="0 0 7 12" fill="none" style={{ color: "var(--text-muted)", flexShrink: 0 }}>
      <path d="M1 1l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Карточка гифта ─────────────────────────────────────────────────────────────
function GiftCard({ gift }: { gift: GiftInventoryItem }) {
  return (
    <div
      className="rounded-[16px] overflow-hidden flex flex-col"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
    >
      {/* Превью */}
      <div
        className="relative flex items-center justify-center"
        style={{ aspectRatio: "1 / 1", background: "rgba(255,255,255,0.04)" }}
      >
        {gift.thumbnailUrl ? (
          <img
            src={gift.thumbnailUrl}
            alt={gift.tgGiftId}
            className="w-full h-full object-contain p-2"
          />
        ) : (
          <span style={{ fontSize: 36, lineHeight: 1 }}>
            {gift.emoji ?? "🎁"}
          </span>
        )}

        {/* Upgraded badge */}
        {gift.isUpgraded && (
          <span
            className="absolute top-1.5 right-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
            style={{ background: "linear-gradient(135deg, #F5C842, #C8960C)", color: "#fff" }}
          >
            UP
          </span>
        )}
      </div>

      {/* Инфо */}
      <div className="px-2 pt-1.5 pb-2 flex items-center justify-between">
        <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
          #{gift.tgGiftId.slice(-6)}
        </span>
        <span className="flex items-center gap-0.5 text-[11px] font-semibold" style={{ color: "var(--gold)" }}>
          <StarIcon size={10} />
          {gift.starCount}
        </span>
      </div>
    </div>
  );
}

// ══ InventoryModal ════════════════════════════════════════════════════════════
export function InventoryModal({ onClose }: InventoryModalProps) {
  useTgBack(onClose);
  const navigate = useNavigate();
  const [tab, setTab] = useState<"gifts" | "stickers">("gifts");
  const [gifts, setGifts] = useState<GiftInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<GiftInventoryItem[]>("/inventory")
      .then(setGifts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stickers: unknown[] = [];

  const totalStars = gifts.reduce((sum, g) => sum + g.starCount, 0);

  function openTransferBot() {
    const handle = TRANSFER_BOT.replace("@", "");
    window.Telegram?.WebApp?.openTelegramLink(`https://t.me/${handle}`);
  }

  function goToShop() {
    onClose();
    navigate("/shop");
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "var(--bg)" }}>

      {/* ── Header ── */}
      <div className="flex-shrink-0 flex items-center gap-3 px-4 pt-5 pb-1">
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-all active:opacity-60"
          style={{ background: "var(--bg-card)", color: "var(--text-dim)" }}
        >
          <BackArrow />
        </button>
        <h2 className="text-[17px] font-bold text-white">Инвентарь</h2>
      </div>

      {/* ── Табы ── */}
      <div className="flex-shrink-0 px-4 mb-3">
        <div
          className="flex rounded-[14px] p-1 gap-1"
          style={{ background: "rgba(255,255,255,0.05)" }}
        >
          <button
            onClick={() => setTab("gifts")}
            className="flex-1 py-2.5 rounded-[10px] text-[13px] font-bold transition-all"
            style={tab === "gifts"
              ? { background: "var(--accent)", color: "#fff", boxShadow: "0 2px 10px rgba(0,136,204,0.35)" }
              : { color: "rgba(255,255,255,0.3)" }
            }
          >
            Гифты ({loading ? "…" : gifts.length})
          </button>
          <button
            onClick={() => setTab("stickers")}
            className="flex-1 py-2.5 rounded-[10px] text-[13px] font-bold transition-all"
            style={tab === "stickers"
              ? { background: "var(--accent)", color: "#fff", boxShadow: "0 2px 10px rgba(0,136,204,0.35)" }
              : { color: "rgba(255,255,255,0.3)" }
            }
          >
            Стикеры ({stickers.length})
          </button>
        </div>
      </div>

      {/* ── Гифты ── */}
      {tab === "gifts" && (
        <>
          {/* Карточка стейкинга */}
          <div
            className="flex-shrink-0 flex items-center gap-3 px-4 py-3.5 mx-4 mb-3 rounded-[16px]"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            <div
              className="w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(245,200,66,0.1)", color: "var(--gold)" }}
            >
              <StackIcon size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-white">
                Стейкинг{" "}
                <span style={{ color: "var(--gold)" }}>12% APR</span>
              </p>
              <p className="text-[11px] mt-[3px]" style={{ color: "var(--text-dim)" }}>
                Все гифты автоматически стейкаются
              </p>
            </div>
            <ChevronRight />
          </div>

          {/* Счётчик */}
          <div className="flex-shrink-0 flex items-center gap-2 px-4 mb-3">
            <span className="flex items-center gap-1 text-[13px] font-semibold" style={{ color: "var(--text-dim)" }}>
              <GiftBoxIcon size={14} /> {gifts.length} Гифтов
            </span>
            <span style={{ color: "var(--text-muted)", fontSize: 12 }}>•</span>
            <span className="flex items-center gap-1 text-[13px] font-semibold" style={{ color: "var(--text-dim)" }}>
              <StarIcon size={14} /> {totalStars} Stars
            </span>
          </div>

          {/* Загрузка */}
          {loading && (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full border-2 animate-spin"
                style={{ borderColor: "transparent", borderTopColor: "var(--accent)" }} />
            </div>
          )}

          {/* Пустой стейт */}
          {!loading && gifts.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center px-8 gap-4">
              <span className="select-none" style={{ color: "rgba(255,255,255,0.12)" }}>
                <MagnifyingGlassIcon size={72} />
              </span>
              <div className="text-center">
                <p className="text-[17px] font-bold leading-snug text-white">
                  Гифтов пока нет. Купи<br />один в нашем магазине<br />
                  или отправь на{" "}
                  <button
                    onClick={openTransferBot}
                    className="font-bold transition-opacity active:opacity-60"
                    style={{ color: "var(--accent)" }}
                  >
                    {TRANSFER_BOT}
                  </button>
                </p>
              </div>

              <div className="flex gap-2.5 w-full mt-2">
                <button
                  onClick={openTransferBot}
                  className="flex-1 py-[14px] rounded-[16px] text-[14px] font-bold"
                  style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)" }}
                >
                  Отправить
                </button>
                <button
                  onClick={goToShop}
                  className="flex-1 py-[14px] rounded-[16px] text-[14px] font-bold"
                  style={{ background: "#ffffff", color: "#09090f" }}
                >
                  В магазин
                </button>
              </div>
            </div>
          )}

          {/* Сетка гифтов */}
          {!loading && gifts.length > 0 && (
            <div className="flex-1 overflow-y-auto px-4 pb-8">
              <div className="grid grid-cols-3 gap-2.5">
                {gifts.map((gift) => (
                  <GiftCard key={gift.id} gift={gift} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Стикеры ── */}
      {tab === "stickers" && (
        <div className="flex-1 flex flex-col items-center justify-center px-8 gap-4">
          <span className="select-none" style={{ color: "rgba(255,255,255,0.12)" }}>
            <MagnifyingGlassIcon size={72} />
          </span>
          <div className="text-center">
            <p className="text-[17px] font-bold text-white">Стикеров пока нет</p>
            <p className="text-[13px] mt-2 leading-relaxed" style={{ color: "var(--text-dim)" }}>
              Здесь будут отображаться твои стикеры
            </p>
          </div>
          <button
            onClick={goToShop}
            className="w-full py-[14px] rounded-[16px] text-[14px] font-bold text-white mt-2"
            style={{ background: "var(--accent)" }}
          >
            В магазин
          </button>
        </div>
      )}
    </div>
  );
}
