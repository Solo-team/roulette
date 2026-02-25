import { useState, useEffect } from "react";
import { api } from "@/api/client";
import type { ReferralInfo } from "@roulette/shared";

// ── Фоновые частицы ───────────────────────────────────────────────────────────
const DOTS = [
  { x: 5,  y: 10, s: 1.4, d: 0.0 }, { x: 91, y: 7,  s: 1.0, d: 0.7 },
  { x: 3,  y: 33, s: 1.8, d: 1.3 }, { x: 94, y: 28, s: 1.3, d: 0.3 },
  { x: 7,  y: 54, s: 1.0, d: 1.9 }, { x: 93, y: 50, s: 1.7, d: 1.0 },
  { x: 4,  y: 73, s: 1.4, d: 2.5 }, { x: 92, y: 70, s: 1.0, d: 1.6 },
  { x: 48, y: 3,  s: 1.3, d: 0.8 }, { x: 53, y: 91, s: 1.0, d: 1.2 },
];

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

  const earnedDisplay = info ? info.earnedTon.toFixed(2) : "0";
  const friendCount   = info?.referredCount ?? 0;
  const shortLink     = info?.referralLink.replace("https://", "") ?? "t.me/RollsBot?start=…";

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "var(--bg)" }}>

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

      {/* ── Шапка ─────────────────────────────────────────────────────────── */}
      <div className="relative flex items-center px-4 pt-5 pb-2 shrink-0">
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-opacity active:opacity-60"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
        >
          <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
            <path d="M7 1L1 7l6 6" stroke="currentColor" strokeWidth="1.6"
              strokeLinecap="round" strokeLinejoin="round"
              style={{ color: "var(--text-dim)" }} />
          </svg>
        </button>
        <span className="absolute left-1/2 -translate-x-1/2 text-[15px] font-semibold text-white">
          Рефералы
        </span>
      </div>

      {/* ── Контент ───────────────────────────────────────────────────────── */}
      <div className="relative flex-1 overflow-y-auto flex flex-col items-center px-4 pt-2 pb-4 gap-4">

        {/* Иконка + заголовок */}
        <div className="flex flex-col items-center gap-2 pt-3 pb-1">
          <div className="animate-float">
            <span style={{ fontSize: 68, lineHeight: 1 }}>💎</span>
          </div>
          <div className="flex flex-col items-center gap-0.5 mt-2 text-center">
            <p className="text-[18px] font-bold text-white leading-snug">
              Пригласи друзей и зарабатывай
            </p>
            <p className="text-[18px] font-bold" style={{ color: "#4CD964" }}>
              10% с их комиссий
            </p>
          </div>
        </div>

        {/* ── Карточка заработка ── */}
        <div
          className="relative w-full rounded-[20px] px-6 py-7 overflow-hidden animate-fade-up"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
        >
          {/* Уголки ◇ */}
          {(["tl","tr","bl","br"] as const).map(pos => (
            <span key={pos} className="absolute text-[14px]" style={{
              color: "rgba(255,255,255,0.18)",
              ...(pos === "tl" ? { top: 10, left: 12 }  : {}),
              ...(pos === "tr" ? { top: 10, right: 12 }  : {}),
              ...(pos === "bl" ? { bottom: 10, left: 12 }  : {}),
              ...(pos === "br" ? { bottom: 10, right: 12 }  : {}),
            }}>◇</span>
          ))}

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
              Без лимитов по количеству друзей.
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
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            animationDelay: "0.1s",
          }}
        >
          <div className="w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0 text-[16px]"
            style={{ background: "rgba(0,136,204,0.14)" }}>
            💎
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-wide mb-0.5"
              style={{ color: "var(--text-muted)" }}>
              Твоя реферальная ссылка
            </p>
            <p className="text-[13px] font-mono truncate" style={{ color: "rgba(255,255,255,0.55)" }}>
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
