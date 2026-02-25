import { useState } from "react";
import { Avatar } from "@/components/profile/Avatar";
import { WalletButton } from "@/components/profile/WalletButton";
import { DonateModal } from "@/components/profile/DonateModal";
import { NftGallery } from "@/components/profile/NftGallery";
import { NftClaimCard } from "@/components/profile/NftClaimCard";
import { useProfile } from "@/hooks/useProfile";

// Декоративные частицы (как в Rolls)
const DOTS = [
  { x: 7,  y: 9,  s: 1.5, d: 0.0, gold: true  },
  { x: 91, y: 7,  s: 2.0, d: 0.8, gold: false },
  { x: 4,  y: 30, s: 1.0, d: 1.6, gold: false },
  { x: 95, y: 25, s: 1.5, d: 0.4, gold: true  },
  { x: 10, y: 52, s: 2.0, d: 2.2, gold: true  },
  { x: 90, y: 46, s: 1.0, d: 1.0, gold: false },
  { x: 5,  y: 70, s: 1.5, d: 1.4, gold: true  },
  { x: 93, y: 66, s: 2.0, d: 0.2, gold: false },
  { x: 50, y: 3,  s: 1.5, d: 1.8, gold: true  },
];

export function ProfilePage() {
  const { profile, profileError, nfts } = useProfile();
  const [showDonate, setShowDonate] = useState(false);
  const [showNfts, setShowNfts] = useState(false);

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: "var(--bg)" }}>
        <div className="flex flex-col items-center gap-4">
          {profileError ? (
            <>
              <span className="text-4xl">⚠️</span>
              <p className="text-white/50 text-sm text-center px-8">
                Не удалось подключиться к серверу.<br />
                Открой бота через Telegram.
              </p>
            </>
          ) : (
            <>
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-2 border-yellow-400/30 border-t-yellow-400 animate-spin" />
                <div className="absolute inset-2 rounded-full border border-purple-400/20 border-t-purple-400 animate-spin"
                  style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
                <span className="absolute inset-0 flex items-center justify-center text-2xl">🎰</span>
              </div>
              <p className="text-white/30 text-sm tracking-wide">Загрузка...</p>
            </>
          )}
        </div>
      </div>
    );
  }

  const daysSince = Math.floor((Date.now() - new Date(profile.createdAt).getTime()) / 86400000);

  return (
    <div className="min-h-screen pb-28" style={{ background: "var(--bg)" }}>

      {/* ── Декоративные частицы ────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {DOTS.map((d, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${d.x}%`,
              top: `${d.y}%`,
              width: d.s * 3,
              height: d.s * 3,
              background: d.gold ? "rgba(245,200,66,0.55)" : "rgba(168,85,247,0.45)",
              animation: `particle-float ${3 + d.d}s ease-in-out infinite`,
              animationDelay: `${d.d}s`,
              boxShadow: d.gold
                ? `0 0 ${d.s * 5}px rgba(245,200,66,0.4)`
                : `0 0 ${d.s * 5}px rgba(168,85,247,0.35)`,
            }}
          />
        ))}
      </div>

      {/* ── Центрированный хедер ────────────────────────────────────── */}
      <div className="relative flex flex-col items-center px-4 pt-8 pb-5">
        {/* Wallet — справа вверху */}
        <div className="absolute top-6 right-4">
          <WalletButton />
        </div>

        {/* Фоновое свечение под аватаром */}
        <div className="absolute" style={{
          width: 180, height: 180,
          top: 0, left: "50%",
          transform: "translateX(-50%)",
          background: "radial-gradient(circle, rgba(124,58,237,0.22) 0%, transparent 70%)",
          filter: "blur(24px)",
          pointerEvents: "none",
        }} />

        {/* Аватар */}
        <div className="relative">
          {/* Вращающееся conic-gradient кольцо */}
          <div className="absolute -inset-[3px] rounded-full" style={{
            background: "conic-gradient(from 0deg, #7C3AED 0%, #F5C842 33%, #A855F7 66%, #F5C842 85%, #7C3AED 100%)",
            filter: "blur(4px)",
            opacity: 0.9,
            animation: "spin-slow 7s linear infinite",
          }} />
          <div className="relative rounded-full p-[2px]" style={{
            background: "linear-gradient(135deg, #F5C842 0%, #A855F7 50%, #FFE580 100%)",
          }}>
            <div className="rounded-full overflow-hidden" style={{ background: "var(--bg)" }}>
              <Avatar photoUrl={profile.photoUrl} firstName={profile.firstName} userId={profile.id} size={76} />
            </div>
          </div>
        </div>

        {/* Имя и username */}
        <h1 className="font-extrabold text-[22px] mt-3 text-white tracking-tight leading-none">
          {profile.firstName}
        </h1>
        {profile.username && (
          <p className="text-white/35 text-sm mt-1">@{profile.username}</p>
        )}
      </div>

      {/* ── Контент ─────────────────────────────────────────────────── */}
      <div className="px-4 flex flex-col gap-3">

        {/* Карточка баланса */}
        <div
          className="rounded-[20px] p-4 animate-fade-up"
          style={{
            background: "linear-gradient(135deg, rgba(124,58,237,0.18) 0%, rgba(8,8,16,0.8) 60%, rgba(245,200,66,0.08) 100%)",
            border: "1px solid rgba(245,200,66,0.18)",
            boxShadow: "0 8px 32px rgba(124,58,237,0.15), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
        >
          <p className="text-white/35 text-[11px] uppercase tracking-[0.18em] mb-2">Баланс</p>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-shimmer font-black leading-none" style={{ fontSize: 34 }}>
                  {profile.coins.toLocaleString()}
                </span>
                <span className="text-white/30 text-sm font-medium">монет</span>
              </div>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="text-sm">💎</span>
                <span className="text-white/40 text-xs">{profile.totalDonatedTon.toFixed(2)} TON задонатено</span>
              </div>
            </div>
            <button
              onClick={() => setShowDonate(true)}
              className="flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-bold relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #FFE566, #F5C842, #C8960C)",
                color: "#1a0e00",
                boxShadow: "0 4px 16px rgba(245,200,66,0.4), inset 0 1px 0 rgba(255,255,255,0.35)",
              }}
            >
              <span className="absolute inset-y-0 animate-btn-shine pointer-events-none" style={{
                width: "50%",
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
              }} />
              <span className="relative">+ Пополнить</span>
            </button>
          </div>
        </div>

        {/* Ежедневный клейм */}
        <div className="animate-fade-up delay-1">
          <NftClaimCard />
        </div>

        {/* Список секций */}
        <div
          className="rounded-[20px] overflow-hidden animate-fade-up delay-2"
          style={{
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          {/* NFT коллекция */}
          <button
            className="w-full flex items-center gap-3 px-4 py-[14px] active:bg-white/5 transition-colors"
            onClick={() => setShowNfts((v) => !v)}
          >
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0" style={{
              background: "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(124,58,237,0.06))",
              border: "1px solid rgba(124,58,237,0.2)",
            }}>
              🖼
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-[14px] font-semibold text-white leading-tight">NFT коллекция</p>
              <p className="text-white/35 text-xs mt-0.5">
                {profile.walletAddress ? `${nfts.length} предметов` : "Подключи кошелёк"}
              </p>
            </div>
            {nfts.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0" style={{
                background: "rgba(124,58,237,0.25)",
                color: "#c4b5fd",
                border: "1px solid rgba(124,58,237,0.3)",
              }}>
                {nfts.length}
              </span>
            )}
            <span className="text-white/20 text-lg ml-1 flex-shrink-0"
              style={{ transform: showNfts ? "rotate(90deg)" : "none", transition: "transform 0.2s" }}>
              ›
            </span>
          </button>

          <div className="h-px mx-4" style={{ background: "rgba(255,255,255,0.05)" }} />

          {/* Дней в игре */}
          <div className="flex items-center gap-3 px-4 py-[14px]">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0" style={{
              background: "linear-gradient(135deg, rgba(249,115,22,0.3), rgba(249,115,22,0.06))",
              border: "1px solid rgba(249,115,22,0.2)",
            }}>
              🔥
            </div>
            <div className="flex-1 text-left">
              <p className="text-[14px] font-semibold text-white leading-tight">В игре</p>
              <p className="text-white/35 text-xs mt-0.5">{daysSince} {daysSince === 1 ? "день" : daysSince < 5 ? "дня" : "дней"}</p>
            </div>
          </div>

          <div className="h-px mx-4" style={{ background: "rgba(255,255,255,0.05)" }} />

          {/* TON донат */}
          <div className="flex items-center gap-3 px-4 py-[14px]">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0" style={{
              background: "linear-gradient(135deg, rgba(0,136,204,0.3), rgba(0,136,204,0.06))",
              border: "1px solid rgba(0,136,204,0.2)",
            }}>
              💎
            </div>
            <div className="flex-1 text-left">
              <p className="text-[14px] font-semibold text-white leading-tight">TON донат</p>
              <p className="text-white/35 text-xs mt-0.5">{profile.totalDonatedTon.toFixed(2)} TON</p>
            </div>
          </div>
        </div>

        {/* NFT галерея — разворачивается */}
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
