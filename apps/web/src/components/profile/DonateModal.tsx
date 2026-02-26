import { useState, useEffect } from "react";
import { useTgBack } from "@/hooks/useTgBack";
import { useTonConnectUI, useTonAddress } from "@tonconnect/ui-react";
import { api } from "@/api/client";
import type { StarsInvoiceResponse } from "@roulette/shared";
import { PencilIcon } from "@/components/ui/icons";

interface DonateModalProps {
  onClose: () => void;
}

const STARS_PACKS = [100, 250, 500, 1000, 2500, 5000];

// ── Официальные SVG-иконки ────────────────────────────────────────────────────
function TonIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none">
      <circle cx="28" cy="28" r="28" fill="#0098EA"/>
      <path d="M37.58 15.4H18.42c-3.49 0-5.67 3.79-3.92 6.79l11.5 19.52c.87 1.5 2.97 1.5 3.84 0l11.5-19.52c1.75-3-.43-6.79-3.84-6.79Z" fill="white"/>
      <path d="M15.96 22.94 26.08 41.71c.87 1.5 2.97 1.5 3.84 0l10.12-18.77c.18.3.31.63.39.97L29.92 41.71c-.87 1.5-2.97 1.5-3.84 0L15.57 23.91c.08-.34.21-.67.39-.97Z" fill="white" fillOpacity=".5"/>
    </svg>
  );
}

function StarsIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none">
      <circle cx="28" cy="28" r="28" fill="#FFB800"/>
      <path d="M28 13l3.8 7.8 8.6 1.2-6.2 6 1.5 8.5L28 32.5l-7.7 4 1.5-8.5-6.2-6 8.6-1.2L28 13Z" fill="white"/>
    </svg>
  );
}

function WalletIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="6" width="20" height="14" rx="3" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M2 10h20" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="16" cy="15" r="1.25" fill="currentColor"/>
    </svg>
  );
}

// ── Stars карточка ─────────────────────────────────────────────────────────────
function StarCard({ stars, loading, onBuy }: {
  stars: number;
  loading: boolean;
  onBuy: () => void;
}) {
  const coins = stars * 10;
  return (
    <button
      onClick={onBuy}
      disabled={loading}
      className="relative flex flex-col items-center overflow-hidden rounded-2xl pt-4 pb-3 gap-1 active:scale-95 transition-transform disabled:opacity-50"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
      }}
    >
      <span className="relative leading-none"><StarsIcon size={38} /></span>
      <span className="relative font-black text-white leading-none mt-1" style={{ fontSize: 20 }}>
        {stars.toLocaleString()}
      </span>
      <span className="relative text-xs" style={{ color: "var(--text-dim)" }}>
        +{coins.toLocaleString()} монет
      </span>

      <div
        className="relative mt-1.5 w-[calc(100%-14px)] py-1.5 rounded-xl text-xs font-bold text-white text-center"
        style={{ background: "var(--accent)" }}
      >
        {loading ? "..." : "Купить"}
      </div>
    </button>
  );
}

// ── Основной компонент ────────────────────────────────────────────────────────
export function DonateModal({ onClose }: DonateModalProps) {
  useTgBack(onClose);
  const [tab, setTab]           = useState<"ton" | "stars">("ton");
  const [amount, setAmount]     = useState("1");
  // Защита от tap-through: игнорируем клик на backdrop первые 300 мс
  const mountedAt = useState(() => Date.now())[0];
  const safeClose = () => { if (Date.now() - mountedAt > 300) onClose(); };
  const [loadingPack, setLoadingPack] = useState<number | null>(null);
  const [loadingTon, setLoadingTon]   = useState(false);
  const [tonError, setTonError]       = useState<string | null>(null);
  const [customOpen, setCustomOpen]   = useState(false);
  const [customVal, setCustomVal]     = useState("");

  const [tonConnectUI] = useTonConnectUI();
  const walletAddress  = useTonAddress();
  const [tonBalance, setTonBalance] = useState<string | null>(null);

  const numAmount = parseFloat(amount) || 0;

  useEffect(() => {
    if (!walletAddress) { setTonBalance(null); return; }
    fetch(`https://toncenter.com/api/v2/getAddressBalance?address=${walletAddress}`)
      .then(r => r.json())
      .then(d => { if (d.ok) setTonBalance((parseInt(d.result) / 1e9).toFixed(2)); })
      .catch(() => {});
  }, [walletAddress]);

  function switchTab(t: "ton" | "stars") {
    setTab(t);
    setAmount(t === "ton" ? "1" : "50");
    setCustomOpen(false);
  }

  // ── TON donate ──
  async function handleTon() {
    if (!numAmount) return;
    setLoadingTon(true);
    setTonError(null);
    try {
      const tx = await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 300,
        messages: [{
          address: import.meta.env.VITE_TON_RECEIVER_ADDRESS ?? "UQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJKZ",
          amount: String(Math.round(numAmount * 1e9)),
        }],
      });
      await api.post("/donate/ton", { txHash: tx.boc, amount });
      onClose();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      // Пользователь отменил — не показываем ошибку
      if (!msg.includes("Reject") && !msg.includes("cancel") && !msg.includes("declined")) {
        setTonError(msg);
      }
    } finally { setLoadingTon(false); }
  }

  // ── Stars donate (конкретный пак) ──
  async function handleStars(stars: number) {
    setLoadingPack(stars);
    try {
      const { invoiceUrl } = await api.post<StarsInvoiceResponse>("/donate/stars", { stars });
      window.Telegram?.WebApp?.openInvoice(invoiceUrl, (status) => {
        if (status === "paid") onClose();
      });
    } catch { /* отменено */ }
    finally { setLoadingPack(null); }
  }

  // ── Stars donate (своя сумма) ──
  async function handleCustomStars() {
    const stars = parseInt(customVal);
    if (!stars || stars < 1) return;
    await handleStars(stars);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: "rgba(0,0,0,0.82)", backdropFilter: "blur(10px)" }}
      onClick={safeClose}
    >
      <div
        className="absolute inset-0 flex flex-col animate-slide-up"
        style={{ background: "var(--bg)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Верхнее свечение */}
        <div className="absolute inset-x-0 top-0 h-48 pointer-events-none" style={{
          background: "radial-gradient(ellipse 100% 60% at 50% 0%, rgba(0,136,204,0.12) 0%, transparent 70%)",
        }} />

        {/* top spacer */}
        <div className="flex-shrink-0 pt-5" />

        {/* ── Табы ── */}
        <div className="relative flex-shrink-0 flex justify-center px-4 mb-4">
          <div className="flex p-1 rounded-2xl gap-1" style={{ background: "rgba(255,255,255,0.05)" }}>
            {(["ton", "stars"] as const).map((t) => (
              <button
                key={t}
                onClick={() => switchTab(t)}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
                style={tab === t
                  ? { background: "var(--accent)", color: "#fff", boxShadow: "0 3px 12px rgba(0,136,204,0.35)" }
                  : { color: "rgba(255,255,255,0.3)" }
                }
              >
                {t === "ton"
                  ? <><TonIcon size={16} /> TON</>
                  : <><StarsIcon size={16} /> Stars</>
                }
              </button>
            ))}
          </div>
        </div>

        {/* ══ КОНТЕНТ ══ */}

        {/* ── Stars: сетка карточек ── */}
        {tab === "stars" && (
          <>
            <div className="relative flex-1 overflow-y-auto px-4 pb-2">
              <div className="grid grid-cols-3 gap-2.5">
                {STARS_PACKS.map((stars) => (
                  <StarCard
                    key={stars}
                    stars={stars}
                    loading={loadingPack === stars}
                    onBuy={() => handleStars(stars)}
                  />
                ))}
              </div>
            </div>

            {/* Своя сумма */}
            <div className="relative flex-shrink-0 px-4 pb-8 pt-2 flex flex-col gap-2">
              {customOpen ? (
                <div className="flex gap-2 animate-fade-up">
                  <input
                    type="number"
                    min="1"
                    value={customVal}
                    onChange={(e) => setCustomVal(e.target.value)}
                    autoFocus
                    placeholder="Кол-во Stars"
                    className="flex-1 text-center text-lg font-bold outline-none rounded-2xl py-3"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid var(--accent-border)",
                      color: "white",
                    }}
                  />
                  <button
                    onClick={handleCustomStars}
                    disabled={!customVal || parseInt(customVal) < 1}
                    className="px-5 rounded-2xl font-bold text-sm disabled:opacity-40"
                    style={{
                      background: "var(--accent)",
                      color: "#fff",
                      boxShadow: "0 4px 16px rgba(0,136,204,0.35)",
                    }}
                  >
                    Купить
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setCustomOpen(true)}
                  className="w-full py-3.5 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid var(--border)",
                    color: "rgba(255,255,255,0.55)",
                  }}
                >
                  <PencilIcon size={15} /> Своя сумма
                </button>
              )}
            </div>
          </>
        )}

        {/* ── TON ── */}
        {tab === "ton" && (() => {
          const bal = tonBalance !== null ? parseFloat(tonBalance) : null;
          const insufficient = walletAddress && bal !== null && numAmount > 0 && numAmount > bal;
          // ширина инпута: каждый символ + запас на точку/запятую
          const inputW = Math.max(1, amount.replace(".", "").length + (amount.includes(".") ? 0.6 : 0));

          return (
            <>
              {/* Центр */}
              <div className="relative flex-1 flex flex-col items-center justify-center px-4 gap-3">
                {/* Glow */}
                <div className="absolute pointer-events-none" style={{
                  width: 200, height: 100,
                  background: "radial-gradient(ellipse, rgba(0,136,204,0.15) 0%, transparent 70%)",
                  filter: "blur(32px)",
                }} />

                {/* Число + TON в одну строку */}
                <label
                  className="relative flex items-baseline justify-center cursor-text w-full"
                  style={{ gap: "0.35em" }}
                >
                  <input
                    type="number"
                    min="0.01"
                    max="1000000"
                    step="0.1"
                    value={amount}
                    onChange={(e) => {
                      let val = e.target.value;
                      val = val.replace(/^0+(\d)/, "$1");
                      if (parseFloat(val) > 1_000_000) val = "1000000";
                      setAmount(val);
                    }}
                    className="bg-transparent outline-none text-center font-black leading-none text-white"
                    style={{
                      fontSize: "clamp(40px, 11vw, 56px)",
                      letterSpacing: "-0.02em",
                      width: `${Math.max(2, amount.length + 0.5)}ch`,
                      maxWidth: "6ch",
                      flexShrink: 0,
                    }}
                  />
                  <span
                    className="font-black leading-none text-white flex-shrink-0"
                    style={{ fontSize: "clamp(40px, 11vw, 56px)", letterSpacing: "-0.02em" }}
                  >TON</span>
                </label>

                {/* Баланс */}
                {walletAddress ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid var(--border)",
                  }}>
                    <span style={{ color: "var(--text-muted)" }}><WalletIcon /></span>
                    <span className="text-sm font-semibold" style={{ color: "var(--text-dim)" }}>
                      {bal !== null ? `${tonBalance} TON` : "…"}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid var(--border)",
                  }}>
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>Кошелёк не подключён</span>
                  </div>
                )}
              </div>

              {/* Предупреждение — зарезервированное место, не сдвигает кнопку */}
              <div className="flex-shrink-0 flex items-center justify-center" style={{ height: 28 }}>
                {tonError && (
                  <p className="text-xs text-center px-4 truncate" style={{ color: "#f87171" }}>{tonError}</p>
                )}
                {!tonError && insufficient && (
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0"
                      style={{ background: "#f87171", color: "#fff" }}>!</span>
                    <span className="text-sm font-semibold" style={{ color: "#f87171" }}>Недостаточно TON</span>
                  </div>
                )}
              </div>

              {/* Кнопка */}
              <div className="relative flex-shrink-0 px-4 pb-10">
                {walletAddress ? (
                  <button
                    onClick={handleTon}
                    disabled={loadingTon || numAmount <= 0 || !!insufficient}
                    className="w-full py-4 rounded-2xl font-bold text-base relative overflow-hidden disabled:opacity-40 btn-primary"
                  >
                    <span className="absolute inset-y-0 animate-btn-shine pointer-events-none" style={{
                      width: "50%",
                      background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                    }} />
                    <span className="relative">
                      {loadingTon ? "Отправка..." : "Пополнить TON"}
                    </span>
                  </button>
                ) : (
                  <button
                    onClick={() => tonConnectUI.openModal()}
                    className="w-full py-4 rounded-2xl font-bold text-base btn-primary"
                  >
                    Подключить кошелёк
                  </button>
                )}
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );
}
