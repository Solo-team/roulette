import { useState, useEffect } from "react";
import { useTonConnectUI, useTonAddress } from "@tonconnect/ui-react";
import { Avatar } from "@/components/profile/Avatar";
import { DonateModal } from "@/components/profile/DonateModal";
import { NftGallery } from "@/components/profile/NftGallery";
import { useProfile } from "@/hooks/useProfile";
import { useStore } from "@/store/index";
import { api } from "@/api/client";
import type { NftClaimResult } from "@roulette/shared";

// ── Частицы ──────────────────────────────────────────────────────────────────
const DOTS = [
  { x: 7,  y: 9,  s: 1.5, d: 0.0 }, { x: 88, y: 7,  s: 1.0, d: 0.8 },
  { x: 4,  y: 28, s: 2.0, d: 1.4 }, { x: 93, y: 24, s: 1.5, d: 0.4 },
  { x: 8,  y: 50, s: 1.0, d: 2.0 }, { x: 92, y: 46, s: 2.0, d: 1.1 },
  { x: 5,  y: 70, s: 1.5, d: 2.6 }, { x: 91, y: 68, s: 1.0, d: 1.7 },
  { x: 48, y: 4,  s: 1.5, d: 0.9 }, { x: 55, y: 88, s: 1.0, d: 1.3 },
];

// ── Иконки ────────────────────────────────────────────────────────────────────
function TonIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none">
      <circle cx="28" cy="28" r="28" fill="#0098EA"/>
      <path d="M37.58 15.4H18.42c-3.49 0-5.67 3.79-3.92 6.79l11.5 19.52c.87 1.5 2.97 1.5 3.84 0l11.5-19.52c1.75-3-.43-6.79-3.84-6.79Z" fill="white"/>
      <path d="M15.96 22.94 26.08 41.71c.87 1.5 2.97 1.5 3.84 0l10.12-18.77c.18.3.31.63.39.97L29.92 41.71c-.87 1.5-2.97 1.5-3.84 0L15.57 23.91c.08-.34.21-.67.39-.97Z" fill="white" fillOpacity=".5"/>
    </svg>
  );
}

function WalletSvg({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="6" width="20" height="14" rx="3" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M2 10h20" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="16" cy="15" r="1.25" fill="currentColor"/>
    </svg>
  );
}

// ── Countdown hook ─────────────────────────────────────────────────────────────
function useCountdown(targetIso: string | null) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!targetIso) return;
    const update = () => setSeconds(Math.max(0, Math.floor((new Date(targetIso).getTime() - Date.now()) / 1000)));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [targetIso]);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return { seconds, h, m, s };
}
function pad(n: number) { return String(n).padStart(2, "0"); }

// ── Chevron ───────────────────────────────────────────────────────────────────
function Chevron() {
  return (
    <svg width="7" height="12" viewBox="0 0 7 12" fill="none" style={{ color: "var(--text-muted)", flexShrink: 0 }}>
      <path d="M1 1l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// ── Разделитель ───────────────────────────────────────────────────────────────
function Divider() {
  return <div className="h-px mx-4" style={{ background: "var(--border)" }} />;
}

// ══ ProfilePage ════════════════════════════════════════════════════════════════
export function ProfilePage() {
  const { profile, profileError, nfts } = useProfile();
  const { updateCoins } = useStore();
  const [showDonate, setShowDonate] = useState(false);
  const [showNfts, setShowNfts]     = useState(false);
  const [tonConnectUI] = useTonConnectUI();
  const walletAddress   = useTonAddress();

  // Claim state
  const [nextClaimAt, setNextClaimAt]   = useState<string | null>(null);
  const [claimLoading, setClaimLoading] = useState(false);
  const [justClaimed, setJustClaimed]   = useState(false);
  const { seconds, h, m, s } = useCountdown(nextClaimAt);
  const canClaim = seconds === 0;

  useEffect(() => {
    if (profile?.lastClaimAt) {
      setNextClaimAt(new Date(new Date(profile.lastClaimAt).getTime() + 24 * 3600 * 1000).toISOString());
    }
  }, [profile?.lastClaimAt]);

  async function handleClaim() {
    setClaimLoading(true);
    try {
      const result = await api.post<NftClaimResult>("/nft/claim");
      updateCoins(result.coins);
      setNextClaimAt(result.nextClaimAt);
      setJustClaimed(true);
      setTimeout(() => setJustClaimed(false), 2500);
    } catch { /* handled */ } finally { setClaimLoading(false); }
  }

  // ── Loading / error ──────────────────────────────────────────────────────────
  if (!profile) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: "var(--bg)" }}>
        <div className="flex flex-col items-center gap-4">
          {profileError ? (
            <>
              <span className="text-4xl">⚠️</span>
              <p className="text-center px-8 text-sm" style={{ color: "var(--text-dim)" }}>
                Не удалось подключиться к серверу.<br />Открой бота через Telegram.
              </p>
            </>
          ) : (
            <>
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full border-2 animate-spin"
                  style={{ borderColor: "transparent", borderTopColor: "var(--accent)" }} />
              </div>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>Загрузка...</p>
            </>
          )}
        </div>
      </div>
    );
  }

  const daysSince = Math.floor((Date.now() - new Date(profile.createdAt).getTime()) / 86400000);
  const daysLabel = daysSince === 1 ? "день" : daysSince < 5 ? "дня" : "дней";

  return (
    <div className="min-h-screen pb-28" style={{ background: "var(--bg)" }}>

      {/* Частицы */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {DOTS.map((d, i) => (
          <div key={i} className="absolute rounded-full" style={{
            left: `${d.x}%`, top: `${d.y}%`,
            width: d.s * 3, height: d.s * 3,
            background: "rgba(255,255,255,0.5)",
            animation: `particle-float ${2.8 + d.d}s ease-in-out infinite`,
            animationDelay: `${d.d}s`,
          }} />
        ))}
      </div>

      {/* ── Топ-бар ─────────────────────────────────────────────────────────── */}
      <div className="relative flex items-center justify-between px-4 pt-6 pb-2">
        {/* Слева: каунтер монет */}
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
        >
          <span className="text-[15px]">🪙</span>
          <span className="text-sm font-bold text-white">{profile.coins.toLocaleString()}</span>
        </div>

        {/* Справа: кнопка кошелька */}
        <button
          onClick={() => tonConnectUI.openModal()}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-opacity active:opacity-70"
          style={{
            background: walletAddress ? "rgba(0,136,204,0.15)" : "var(--bg-card)",
            border: `1px solid ${walletAddress ? "var(--accent-border)" : "var(--border)"}`,
            color: walletAddress ? "var(--accent)" : "var(--text-dim)",
          }}
        >
          <WalletSvg size={17} />
        </button>
      </div>

      {/* ── Аватар ──────────────────────────────────────────────────────────── */}
      <div className="relative flex flex-col items-center pt-3 pb-5">
        <div className="rounded-full p-[2.5px]" style={{ background: "rgba(255,255,255,0.18)" }}>
          <div className="rounded-full overflow-hidden" style={{ background: "var(--bg)" }}>
            <Avatar photoUrl={profile.photoUrl} firstName={profile.firstName} userId={profile.id} size={82} />
          </div>
        </div>
        <p className="mt-3 text-[15px] font-semibold" style={{ color: "var(--text-dim)" }}>
          {profile.username ? `@${profile.username}` : profile.firstName}
        </p>
      </div>

      {/* ── Контент ─────────────────────────────────────────────────────────── */}
      <div className="px-4 flex flex-col gap-3">

        {/* Карточка баланса */}
        <div
          className="rounded-[20px] px-4 py-4 animate-fade-up"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
        >
          <p className="text-[11px] tracking-[0.15em] uppercase mb-3" style={{ color: "var(--text-muted)" }}>
            Баланс
          </p>
          <div className="flex items-center gap-2">
            {/* Левая часть: иконка + сумма */}
            <div className="flex-1 flex items-center gap-2.5 min-w-0">
              <TonIcon size={26} />
              <span className="font-black text-white leading-none" style={{ fontSize: 26 }}>
                {profile.coins.toLocaleString()}
              </span>
              <span className="text-sm" style={{ color: "var(--text-dim)" }}>монет</span>
            </div>
            {/* Правая часть: кнопки */}
            <button
              onClick={() => setShowDonate(true)}
              className="flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-bold btn-primary"
            >
              Пополнить
            </button>
            <button
              onClick={() => tonConnectUI.openModal()}
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: walletAddress ? "rgba(0,136,204,0.12)" : "var(--bg-card-2)",
                color: walletAddress ? "var(--accent)" : "var(--text-muted)",
              }}
            >
              <WalletSvg size={16} />
            </button>
          </div>
        </div>

        {/* Список */}
        <div
          className="rounded-[20px] overflow-hidden animate-fade-up"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)", animationDelay: "0.06s" }}
        >

          {/* NFT коллекция */}
          <button
            className="w-full flex items-center gap-3 px-4 py-[14px] active:bg-white/5 transition-colors"
            onClick={() => setShowNfts((v) => !v)}
          >
            <div className="w-10 h-10 rounded-[12px] flex items-center justify-center text-[20px] flex-shrink-0"
              style={{ background: "var(--bg-card-2)" }}>
              🖼
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-[14px] font-semibold text-white leading-tight">NFT коллекция</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-dim)" }}>
                {profile.walletAddress ? `${nfts.length} предметов` : "Подключи кошелёк"}
              </p>
            </div>
            {nfts.length > 0 && (
              <span
                className="px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0"
                style={{ background: "var(--accent-dim)", color: "var(--accent)", border: "1px solid var(--accent-border)" }}
              >
                {nfts.length}
              </span>
            )}
            <div style={{ transform: showNfts ? "rotate(90deg)" : "none", transition: "transform 0.2s" }}>
              <Chevron />
            </div>
          </button>

          <Divider />

          {/* Ежедневный клейм */}
          <div className="flex items-center gap-3 px-4 py-[14px]">
            <div
              className="w-10 h-10 rounded-[12px] flex items-center justify-center text-[20px] flex-shrink-0"
              style={{ background: canClaim ? "rgba(0,136,204,0.18)" : "var(--bg-card-2)" }}
            >
              {justClaimed ? "✨" : canClaim ? "🎁" : "⏳"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-white leading-tight">Ежедневный клейм</p>
              {!canClaim && !justClaimed ? (
                <p className="text-xs font-mono mt-0.5" style={{ color: "var(--accent)" }}>
                  {pad(h)}:{pad(m)}:{pad(s)}
                </p>
              ) : (
                <p className="text-xs mt-0.5" style={{ color: "var(--text-dim)" }}>+100 монет</p>
              )}
            </div>
            <button
              onClick={handleClaim}
              disabled={!canClaim || claimLoading}
              className="flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-35"
              style={canClaim
                ? { background: "var(--accent)", color: "#fff", boxShadow: "0 3px 10px rgba(0,136,204,0.3)" }
                : { background: "var(--bg-card-2)", color: "var(--text-dim)" }
              }
            >
              {claimLoading ? "..." : canClaim ? "Забрать" : "Ждать"}
            </button>
          </div>

          <Divider />

          {/* В игре */}
          <div className="flex items-center gap-3 px-4 py-[14px]">
            <div className="w-10 h-10 rounded-[12px] flex items-center justify-center text-[20px] flex-shrink-0"
              style={{ background: "var(--bg-card-2)" }}>
              🔥
            </div>
            <div className="flex-1">
              <p className="text-[14px] font-semibold text-white leading-tight">В игре</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-dim)" }}>{daysSince} {daysLabel}</p>
            </div>
          </div>

          <Divider />

          {/* TON донат */}
          <div className="flex items-center gap-3 px-4 py-[14px]">
            <div className="w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(0,136,204,0.12)" }}>
              <TonIcon size={24} />
            </div>
            <div className="flex-1">
              <p className="text-[14px] font-semibold text-white leading-tight">TON донат</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-dim)" }}>
                {profile.totalDonatedTon.toFixed(2)} TON
              </p>
            </div>
          </div>
        </div>

        {/* NFT галерея */}
        {showNfts && (
          <div className="animate-fade-up">
            <NftGallery nfts={nfts} />
          </div>
        )}
      </div>

      {showDonate && <DonateModal onClose={() => setShowDonate(false)} />}
    </div>
  );
}
