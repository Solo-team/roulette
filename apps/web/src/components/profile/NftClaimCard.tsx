import { useState, useEffect } from "react";
import { api } from "@/api/client";
import { useStore } from "@/store/index";
import type { NftClaimResult } from "@roulette/shared";

function useCountdown(targetIso: string | null) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!targetIso) return;
    const update = () => {
      const diff = Math.max(0, Math.floor((new Date(targetIso).getTime() - Date.now()) / 1000));
      setSeconds(diff);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [targetIso]);

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return { seconds, h, m, s };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function NftClaimCard() {
  const { profile, updateCoins } = useStore();
  const [nextClaimAt, setNextClaimAt] = useState<string | null>(profile?.lastClaimAt ?? null);
  const [loading, setLoading] = useState(false);
  const [justClaimed, setJustClaimed] = useState(false);
  const { seconds, h, m, s } = useCountdown(nextClaimAt);

  const canClaim = seconds === 0;

  useEffect(() => {
    if (profile?.lastClaimAt) {
      const next = new Date(new Date(profile.lastClaimAt).getTime() + 24 * 60 * 60 * 1000);
      setNextClaimAt(next.toISOString());
    }
  }, [profile?.lastClaimAt]);

  async function handleClaim() {
    setLoading(true);
    try {
      const result = await api.post<NftClaimResult>("/nft/claim");
      updateCoins(result.coins);
      setNextClaimAt(result.nextClaimAt);
      setJustClaimed(true);
      setTimeout(() => setJustClaimed(false), 2500);
    } catch {
      // handled by timer
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="rounded-[20px] overflow-hidden animate-fade-up"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        animationDelay: "0.3s",
      }}
    >
      <div className="px-4 py-[14px] flex items-center gap-3">
        {/* icon */}
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
          style={{
            background: canClaim
              ? "var(--accent)"
              : "var(--bg-card-2)",
            boxShadow: canClaim ? "0 4px 14px rgba(0,136,204,0.35)" : "none",
          }}
        >
          {justClaimed ? "✨" : canClaim ? "🎁" : "⏳"}
        </div>

        {/* text */}
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold text-white leading-tight">
            {justClaimed ? "Монеты получены!" : "Ежедневный клейм"}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-dim)" }}>+100 монет каждые 24 часа</p>

          {!canClaim && !justClaimed && (
            <div className="flex items-center gap-1.5 mt-2">
              {[
                { val: pad(h), label: "ч" },
                { val: pad(m), label: "м" },
                { val: pad(s), label: "с" },
              ].map(({ val, label }) => (
                <div key={label} className="flex items-baseline gap-0.5">
                  <span
                    className="font-mono font-bold text-sm px-1.5 py-0.5 rounded-lg"
                    style={{ background: "rgba(255,255,255,0.07)", color: "var(--accent)" }}
                  >
                    {val}
                  </span>
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* button */}
        <button
          onClick={handleClaim}
          disabled={!canClaim || loading}
          className="flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-35"
          style={
            canClaim
              ? {
                  background: "var(--accent)",
                  color: "#fff",
                  boxShadow: "0 4px 14px rgba(0,136,204,0.35)",
                }
              : {
                  background: "rgba(255,255,255,0.07)",
                  color: "rgba(255,255,255,0.3)",
                }
          }
        >
          {loading ? "..." : canClaim ? "Забрать" : "Ждать"}
        </button>
      </div>
    </div>
  );
}
