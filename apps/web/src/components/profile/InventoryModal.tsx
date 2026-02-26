import { useState } from "react";
import { useTgBack } from "@/hooks/useTgBack";
import { StackIcon, GiftBoxIcon, MagnifyingGlassIcon } from "@/components/ui/icons";

function TonIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none">
      <circle cx="28" cy="28" r="28" fill="#0098EA" />
      <path d="M37.58 15.4H18.42c-3.49 0-5.67 3.79-3.92 6.79l11.5 19.52c.87 1.5 2.97 1.5 3.84 0l11.5-19.52c1.75-3-.43-6.79-3.84-6.79Z" fill="white" />
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

// ══ InventoryModal ════════════════════════════════════════════════════════════
export function InventoryModal({ onClose }: InventoryModalProps) {
  useTgBack(onClose);
  const [tab, setTab] = useState<"gifts" | "stickers">("gifts");

  const gifts: unknown[]    = [];
  const stickers: unknown[] = [];

  function openTransferBot() {
    const handle = TRANSFER_BOT.replace("@", "");
    window.Telegram?.WebApp?.openTelegramLink(`https://t.me/${handle}`);
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "var(--bg)" }}>

      {/* top spacer */}
      <div className="flex-shrink-0 pt-5" />

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
            Гифты ({gifts.length})
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
              <TonIcon size={14} /> 0 TON
            </span>
          </div>

          {/* Пустой стейт */}
          {gifts.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center px-8 gap-4">
              <span className="select-none" style={{ color: "rgba(255,255,255,0.12)" }}><MagnifyingGlassIcon size={72} /></span>
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
                  onClick={onClose}
                  className="flex-1 py-[14px] rounded-[16px] text-[14px] font-bold"
                  style={{ background: "#ffffff", color: "#09090f" }}
                >
                  В магазин
                </button>
              </div>
            </div>
          )}

          {/* Список гифтов (будущее) */}
          {gifts.length > 0 && (
            <div className="flex-1 overflow-y-auto px-4 pb-8">
              <div className="grid grid-cols-3 gap-2">
                {/* gift cards */}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Стикеры ── */}
      {tab === "stickers" && (
        <div className="flex-1 flex flex-col items-center justify-center px-8 gap-4">
          <span className="select-none" style={{ color: "rgba(255,255,255,0.12)" }}><MagnifyingGlassIcon size={72} /></span>
          <div className="text-center">
            <p className="text-[17px] font-bold text-white">Стикеров пока нет</p>
            <p className="text-[13px] mt-2 leading-relaxed" style={{ color: "var(--text-dim)" }}>
              Здесь будут отображаться твои стикеры
            </p>
          </div>
          <button
            onClick={onClose}
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
