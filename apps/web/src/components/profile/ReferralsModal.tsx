import { useState, useEffect } from "react";
import { useTgBack } from "@/hooks/useTgBack";
import { api } from "@/api/client";
import type { ReferralInfo } from "@roulette/shared";
import { DiamondIcon, LinkIcon } from "@/components/ui/icons";

// ── Иконка копирования ────────────────────────────────────────────────────────
function CopyIcon({ done }: { done: boolean }) {
  if (done) {
    return (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M3 9.5l4 4 8-8" stroke="#4CD964" strokeWidth="1.7"
          strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="6" y="6" width="9" height="9" rx="2" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M3 12V3h9" stroke="currentColor" strokeWidth="1.4"
        strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

interface Props {
  onClose: () => void;
}

export function ReferralsModal({ onClose }: Props) {
  useTgBack(onClose);
  const [info, setInfo]       = useState<ReferralInfo | null>(null);
  const [copied, setCopied]   = useState(false);
  const [showHow, setShowHow] = useState(false);

  useEffect(() => {
    api.get<ReferralInfo>("/referrals").then(setInfo).catch(() => {});
  }, []);

  function handleCopy() {
    const link = info?.referralLink ?? "";
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleInvite() {
    if (!info) return;
    const text = encodeURIComponent("Играй вместе со мной в Rolls! 🎰");
    const url  = encodeURIComponent(info.referralLink);
    window.Telegram?.WebApp?.openTelegramLink(
      `https://t.me/share/url?url=${url}&text=${text}`
    );
  }

  const earnedDisplay = info
    ? parseFloat(info.earnedTon.toFixed(2)).toString()
    : "0";
  const friendCount = info?.referredCount ?? 0;
  const shortLink   = info?.referralLink.replace("https://", "") ?? "t.me/…?start=…";

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "var(--bg)" }}>

      {/* ── Контент ───────────────────────────────────────────────────────── */}
      <div className="relative flex-1 overflow-y-auto flex flex-col items-center px-4 pb-4 gap-4">

        {/* ── Diamond hero ── */}
        <div className="relative flex items-center justify-center mt-10 mb-1">
          {/* Outer rotating ring */}
          <div
            className="absolute rounded-full animate-spin-slow"
            style={{
              width: 108, height: 108,
              border: "1px solid",
              borderColor: "rgba(0,200,255,0.25) transparent rgba(0,200,255,0.1) transparent",
            }}
          />
          {/* Inner glow */}
          <div
            className="absolute rounded-full animate-avatar-glow"
            style={{
              width: 80, height: 80,
              background: "radial-gradient(circle, rgba(0,180,255,0.28), transparent 70%)",
              filter: "blur(10px)",
            }}
          />
          {/* Diamond */}
          <span
            className="relative z-10 animate-diamond select-none"
            style={{ color: "#4ef2f8" }}
          >
            <DiamondIcon size={60} />
          </span>
        </div>

        {/* Headline */}
        <div className="flex flex-col items-center gap-[3px] text-center animate-fade-up">
          <p className="text-[19px] font-bold text-white leading-snug">
            Пригласи друзей и зарабатывай
          </p>
          <p className="text-[19px] font-bold" style={{ color: "#4CD964" }}>
            10% с их комиссий
          </p>
        </div>

        {/* ── Карточка заработка ── */}
        <div
          className="relative w-full rounded-[20px] px-6 py-6 overflow-hidden animate-fade-up"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)", animationDelay: "0.06s" }}
        >
          <p className="text-center text-[11px] tracking-[0.15em] uppercase mb-2"
            style={{ color: "var(--text-muted)" }}>
            Ты заработал
          </p>
          <p className="text-center font-black text-white leading-none" style={{ fontSize: 44 }}>
            {earnedDisplay} TON
          </p>

          <div className="flex justify-center mt-5">
            <button
              onClick={() => setShowHow(v => !v)}
              className="px-5 py-2.5 rounded-[12px] text-[13px] font-semibold transition-opacity active:opacity-60"
              style={{ background: "var(--bg-card-2)", color: "var(--text-dim)" }}
            >
              Как это работает
            </button>
          </div>

          {showHow && (
            <p className="mt-4 text-[12px] leading-relaxed text-center"
              style={{ color: "var(--text-dim)" }}>
              Когда друг, которого ты пригласил, играет и платит комиссию —
              ты автоматически получаешь{" "}
              <span className="text-white font-bold">10%</span> от неё в TON.
              Без лимитов.
            </p>
          )}
        </div>

        {/* Счётчик друзей */}
        <p className="text-[13px]" style={{ color: "var(--text-muted)" }}>
          Ты пригласил{" "}
          <span className="font-semibold" style={{ color: "rgba(255,255,255,0.6)" }}>
            {friendCount}
          </span>{" "}
          {friendWord(friendCount)}
        </p>

        {/* ── Карточка со ссылкой ── */}
        <div
          className="w-full rounded-[18px] px-4 py-3.5 flex items-center gap-3 animate-fade-up"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)", animationDelay: "0.12s" }}
        >
          <div className="w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0"
            style={{ background: "rgba(0,136,204,0.14)", color: "var(--accent)" }}>
            <LinkIcon size={15} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-wide mb-0.5" style={{ color: "var(--text-muted)" }}>
              Твоя реферальная ссылка
            </p>
            <p className="text-[13px] font-mono truncate" style={{ color: "rgba(255,255,255,0.5)" }}>
              {shortLink}
            </p>
          </div>
          <button
            onClick={handleCopy}
            className="w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0 transition-all active:scale-90"
            style={{
              background: copied ? "rgba(76,217,100,0.14)" : "var(--bg-card-2)",
              color: copied ? "#4CD964" : "var(--text-dim)",
            }}
          >
            <CopyIcon done={copied} />
          </button>
        </div>

      </div>

      {/* ── Нижние кнопки ─────────────────────────────────────────────────── */}
      <div
        className="shrink-0 px-4 pt-3 flex gap-3"
        style={{
          background: "var(--bg)",
          borderTop: "1px solid var(--border)",
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 20px)",
        }}
      >
        <button
          onClick={handleCopy}
          className="flex-1 py-[14px] rounded-[16px] text-[14px] font-bold transition-all active:scale-95"
          style={copied
            ? { background: "rgba(76,217,100,0.13)", color: "#4CD964", border: "1px solid rgba(76,217,100,0.22)" }
            : { background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.55)", border: "1px solid var(--border)" }
          }
        >
          {copied ? "Скопировано ✓" : "Скопировать ссылку"}
        </button>

        <button
          onClick={handleInvite}
          className="flex-1 py-[14px] rounded-[16px] text-[14px] font-bold transition-all active:scale-95"
          style={{ background: "#ffffff", color: "#0a0a14" }}
        >
          Пригласить друзей
        </button>
      </div>
    </div>
  );
}

function friendWord(n: number): string {
  if (n % 10 === 1 && n % 100 !== 11) return "друга";
  if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return "друзей";
  return "друзей";
}
