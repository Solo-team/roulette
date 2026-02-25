import { useState } from "react";
import { useTonConnectUI, useTonAddress } from "@tonconnect/ui-react";
import type { NftItem } from "@roulette/shared";

interface InventoryModalProps {
  nfts: NftItem[];
  totalDonatedTon: number;
  onClose: () => void;
}

// ── Иконка TON ────────────────────────────────────────────────────────────────
function TonIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none">
      <circle cx="28" cy="28" r="28" fill="#0098EA"/>
      <path d="M37.58 15.4H18.42c-3.49 0-5.67 3.79-3.92 6.79l11.5 19.52c.87 1.5 2.97 1.5 3.84 0l11.5-19.52c1.75-3-.43-6.79-3.84-6.79Z" fill="white"/>
    </svg>
  );
}

// ── NFT карточка ──────────────────────────────────────────────────────────────
function NftCard({ nft }: { nft: NftItem }) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
    >
      <div className="relative w-full aspect-square overflow-hidden">
        <img src={nft.image} alt={nft.name} className="w-full h-full object-cover" loading="lazy" />
      </div>
      <div className="p-2">
        <p className="text-white text-xs font-semibold truncate">{nft.name}</p>
        {nft.collection && (
          <p className="text-[10px] mt-0.5 truncate" style={{ color: "var(--text-dim)" }}>{nft.collection}</p>
        )}
      </div>
    </div>
  );
}

// ── Пустой стейт ─────────────────────────────────────────────────────────────
function EmptyState({ onConnect, onClose }: { onConnect: () => void; onClose: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 gap-5">
      <div className="text-6xl select-none" style={{ filter: "grayscale(0.3)" }}>🔍</div>
      <p className="text-center text-[16px] font-semibold leading-snug" style={{ color: "rgba(255,255,255,0.9)" }}>
        NFT пока нет. Подключи кошелёк или купи в{" "}
        <a
          href="https://getgems.io"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "var(--accent)" }}
        >
          getgems.io
        </a>
      </p>
      <div className="flex gap-2.5 w-full">
        <button
          onClick={onClose}
          className="flex-1 py-3.5 rounded-2xl text-sm font-bold"
          style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)" }}
        >
          Закрыть
        </button>
        <button
          onClick={onConnect}
          className="flex-1 py-3.5 rounded-2xl text-sm font-bold text-white btn-primary"
        >
          Подключить
        </button>
      </div>
    </div>
  );
}

// ══ InventoryModal ════════════════════════════════════════════════════════════
export function InventoryModal({ nfts, totalDonatedTon, onClose }: InventoryModalProps) {
  const [tab, setTab] = useState<"nft" | "other">("nft");
  const [tonConnectUI] = useTonConnectUI();
  const walletAddress   = useTonAddress();

  const hasNfts = nfts.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "var(--bg)" }}>

      {/* ── Хедер ── */}
      <div className="flex items-center justify-between px-4 pt-6 pb-3 flex-shrink-0">
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.45)" }}
        >
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <path d="M1 1l9 9M10 1l-9 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
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
            onClick={() => setTab("nft")}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
            style={tab === "nft"
              ? { background: "var(--accent)", color: "#fff", boxShadow: "0 3px 10px rgba(0,136,204,0.3)" }
              : { color: "rgba(255,255,255,0.35)" }
            }
          >
            NFT{nfts.length > 0 ? ` (${nfts.length})` : " (0)"}
          </button>
          <button
            onClick={() => setTab("other")}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
            style={tab === "other"
              ? { background: "var(--accent)", color: "#fff", boxShadow: "0 3px 10px rgba(0,136,204,0.3)" }
              : { color: "rgba(255,255,255,0.35)" }
            }
          >
            Другое (0)
          </button>
        </div>
      </div>

      {/* ── Контент ── */}
      {tab === "nft" && (
        <>
          {walletAddress && (
            <>
              {/* Инфо-строка */}
              <div className="flex-shrink-0 flex items-center gap-3 px-4 py-3 mx-4 mb-3 rounded-2xl"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                <div className="w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(0,136,204,0.12)" }}>
                  <TonIcon size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">Кошелёк подключён</p>
                  <p className="text-xs mt-0.5 font-mono truncate" style={{ color: "var(--text-dim)" }}>
                    {walletAddress.slice(0, 8)}…{walletAddress.slice(-6)}
                  </p>
                </div>
              </div>

              {/* Счётчики */}
              <div className="flex-shrink-0 flex items-center gap-2 px-4 mb-4">
                <span className="text-sm font-semibold" style={{ color: "var(--text-dim)" }}>
                  🎁 {nfts.length} NFT
                </span>
                <span style={{ color: "var(--text-muted)" }}>•</span>
                <span className="flex items-center gap-1 text-sm font-semibold" style={{ color: "var(--text-dim)" }}>
                  <TonIcon size={14} /> {totalDonatedTon.toFixed(2)} TON задонатено
                </span>
              </div>
            </>
          )}

          {hasNfts ? (
            <div className="flex-1 overflow-y-auto px-4 pb-8">
              <div className="grid grid-cols-3 gap-2">
                {nfts.map((nft) => (
                  <NftCard key={nft.address} nft={nft} />
                ))}
              </div>
            </div>
          ) : (
            <EmptyState
              onConnect={() => walletAddress ? tonConnectUI.disconnect() : tonConnectUI.openModal()}
              onClose={onClose}
            />
          )}
        </>
      )}

      {tab === "other" && (
        <div className="flex-1 flex flex-col items-center justify-center px-8 gap-4">
          <div className="text-5xl">📦</div>
          <p className="text-center text-sm font-medium" style={{ color: "var(--text-dim)" }}>
            Здесь пока ничего нет
          </p>
        </div>
      )}
    </div>
  );
}
