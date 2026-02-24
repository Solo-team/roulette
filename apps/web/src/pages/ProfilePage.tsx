import { useState } from "react";
import { Avatar } from "@/components/profile/Avatar";
import { WalletButton } from "@/components/profile/WalletButton";
import { DonateModal } from "@/components/profile/DonateModal";
import { NftGallery } from "@/components/profile/NftGallery";
import { NftClaimCard } from "@/components/profile/NftClaimCard";
import { useProfile } from "@/hooks/useProfile";

export function ProfilePage() {
  const { profile, profileError, nfts } = useProfile();
  const [showDonate, setShowDonate] = useState(false);

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
              <div className="relative w-16 h-16 animate-float">
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
    <div className="min-h-screen pb-24 relative overflow-x-hidden" style={{ background: "var(--bg)" }}>

      {/* Ambient blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 -left-24 w-80 h-80 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)" }} />
        <div className="absolute top-24 -right-20 w-64 h-64 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(245,200,66,0.1) 0%, transparent 70%)" }} />
      </div>

      {/* Header */}
      <div className="relative px-4 pt-10 pb-5">
        <div className="absolute -top-8 -right-8 w-56 h-56 rounded-full border border-yellow-400/8 animate-spin-slow pointer-events-none" />
        <div className="absolute top-0 right-6 w-32 h-32 rounded-full border border-purple-500/8 pointer-events-none"
          style={{ animation: "spin-slow 18s linear infinite reverse" }} />

        <div className="animate-fade-up flex items-center gap-3.5">
          {/* Avatar with gradient ring */}
          <div className="relative flex-shrink-0">
            <div className="absolute -inset-0.5 rounded-full animate-glow"
              style={{ background: "linear-gradient(135deg, #F5C842, #7C3AED)", filter: "blur(3px)", opacity: 0.7 }} />
            <div className="relative rounded-full p-0.5"
              style={{ background: "linear-gradient(135deg, #F5C842 0%, #7C3AED 100%)" }}>
              <div className="rounded-full overflow-hidden" style={{ background: "var(--bg)" }}>
                <Avatar photoUrl={profile.photoUrl} firstName={profile.firstName} userId={profile.id} size={66} />
              </div>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold leading-snug truncate">{profile.firstName}</h1>
            {profile.username && <p className="text-white/35 text-sm">@{profile.username}</p>}
            <div className="flex items-center gap-1.5 mt-1.5">
              <span>🪙</span>
              <span className="text-shimmer font-extrabold text-lg tracking-tight">
                {profile.coins.toLocaleString()}
              </span>
              <span className="text-white/25 text-xs">монет</span>
            </div>
          </div>
          <div className="flex-shrink-0"><WalletButton /></div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mt-5">
          {[
            { icon: "💎", val: profile.totalDonatedTon.toFixed(2), sub: "TON донат" },
            { icon: "🖼",  val: String(nfts.length),               sub: "NFT" },
            { icon: "📅",  val: `${daysSince}д`,                   sub: "С нами" },
          ].map((s, i) => (
            <div key={s.sub} className="glass rounded-2xl p-3 flex flex-col items-center gap-1 animate-fade-up"
              style={{ animationDelay: `${0.1 + i * 0.08}s` }}>
              <span className="text-xl">{s.icon}</span>
              <span className="font-bold text-base text-white leading-none">{s.val}</span>
              <span className="text-white/30 text-[10px]">{s.sub}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative px-4 flex flex-col gap-3">
        <button onClick={() => setShowDonate(true)}
          className="animate-fade-up delay-2 btn-gold w-full py-3.5 text-[15px] flex items-center justify-center gap-2.5">
          <span className="animate-float text-xl">💎</span>
          Задонатить
        </button>
        <div className="animate-fade-up delay-3"><NftClaimCard /></div>
        <div className="animate-fade-up delay-4"><NftGallery nfts={nfts} /></div>
      </div>

      {showDonate && <DonateModal onClose={() => setShowDonate(false)} />}
    </div>
  );
}
