import { useState } from "react";

interface InventoryModalProps {
  onClose: () => void;
}

function ChevronRight() {
  return (
    <svg width="7" height="12" viewBox="0 0 7 12" fill="none" style={{ color: "var(--text-muted)", flexShrink: 0 }}>
      <path d="M1 1l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// ══ InventoryModal ════════════════════════════════════════════════════════════
export function InventoryModal({ onClose }: InventoryModalProps) {
  const [tab, setTab] = useState<"gifts" | "stickers">("gifts");

  // In the future these will come from the server
  const gifts: unknown[]    = [];
  const stickers: unknown[] = [];

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "var(--bg)" }}>

      {/* ── Хедер ── */}
      <div className="flex items-center justify-between px-4 pt-6 pb-3 flex-shrink-0">
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.45)" }}
        >
          <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
            <path d="M1 7h16M1 7l6-6M1 7l6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h2 className="text-[15px] font-bold text-white">Инвентарь</h2>
        <div className="w-9" />
      </div>

      {/* ── Табы ── */}
      <div className="flex-shrink-0 px-4 mb-4">
        <div
          className="flex rounded-2xl p-1 gap-1"
          style={{ background: "rgba(255,255,255,0.05)" }}
        >
          <button
            onClick={() => setTab("gifts")}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
            style={tab === "gifts"
              ? { background: "var(--accent)", color: "#fff", boxShadow: "0 3px 10px rgba(0,136,204,0.3)" }
              : { color: "rgba(255,255,255,0.35)" }
            }
          >
            Гифты ({gifts.length})
          </button>
          <button
            onClick={() => setTab("stickers")}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
            style={tab === "stickers"
              ? { background: "var(--accent)", color: "#fff", boxShadow: "0 3px 10px rgba(0,136,204,0.3)" }
              : { color: "rgba(255,255,255,0.35)" }
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
            className="flex-shrink-0 flex items-center gap-3 px-4 py-3.5 mx-4 mb-3 rounded-2xl"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            <div
              className="w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0 text-xl"
              style={{ background: "rgba(0,136,204,0.12)" }}
            >
              💎
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white">Стейкинг 12% APR</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-dim)" }}>
                Все гифты автоматически стейкаются
              </p>
            </div>
            <ChevronRight />
          </div>

          {/* Счётчик */}
          <div className="flex-shrink-0 flex items-center gap-2 px-4 mb-4">
            <span className="text-sm font-semibold" style={{ color: "var(--text-dim)" }}>
              🎁 {gifts.length} Гифтов
            </span>
            <span style={{ color: "var(--text-muted)" }}>•</span>
            <span className="text-sm font-semibold" style={{ color: "var(--text-dim)" }}>
              💎 0 TON
            </span>
          </div>

          {/* Пустой стейт */}
          {gifts.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center px-8 gap-5">
              <div className="text-6xl select-none" style={{ filter: "grayscale(0.2)" }}>🔍</div>
              <div className="text-center">
                <p className="text-[16px] font-bold leading-snug" style={{ color: "rgba(255,255,255,0.9)" }}>
                  Здесь пока пусто
                </p>
                <p className="text-sm mt-2 leading-relaxed" style={{ color: "var(--text-dim)" }}>
                  Попроси друзей отправить тебе подарки — они появятся прямо здесь
                </p>
              </div>
              <div className="flex gap-2.5 w-full">
                <button
                  onClick={onClose}
                  className="flex-1 py-3.5 rounded-2xl text-sm font-bold"
                  style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)" }}
                >
                  Отправить
                </button>
                <button
                  className="flex-1 py-3.5 rounded-2xl text-sm font-bold text-white"
                  style={{ background: "var(--accent)" }}
                >
                  В магазин
                </button>
              </div>
            </div>
          )}

          {/* Список гифтов (заглушка для будущего) */}
          {gifts.length > 0 && (
            <div className="flex-1 overflow-y-auto px-4 pb-8">
              <div className="grid grid-cols-3 gap-2">
                {/* gift cards here */}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Стикеры ── */}
      {tab === "stickers" && (
        <div className="flex-1 flex flex-col items-center justify-center px-8 gap-5">
          <div className="text-6xl select-none" style={{ filter: "grayscale(0.2)" }}>🔍</div>
          <div className="text-center">
            <p className="text-[16px] font-bold leading-snug" style={{ color: "rgba(255,255,255,0.9)" }}>
              Стикеров нет
            </p>
            <p className="text-sm mt-2 leading-relaxed" style={{ color: "var(--text-dim)" }}>
              Здесь будут отображаться твои стикеры
            </p>
          </div>
          <button
            className="w-full py-3.5 rounded-2xl text-sm font-bold text-white"
            style={{ background: "var(--accent)" }}
          >
            В магазин
          </button>
        </div>
      )}
    </div>
  );
}
