import { useState, useEffect } from "react";
import { useTonConnectUI, useTonAddress } from "@tonconnect/ui-react";
import { Avatar } from "@/components/profile/Avatar";
import { DonateModal } from "@/components/profile/DonateModal";
import { InventoryModal } from "@/components/profile/InventoryModal";
import { ReferralsModal } from "@/components/profile/ReferralsModal";
import { TasksModal } from "@/components/profile/TasksModal";
import { useProfile } from "@/hooks/useProfile";
import { useStore } from "@/store/index";
import { api } from "@/api/client";
import type { NftClaimResult, TasksInfo } from "@roulette/shared";

// ── Icons ──────────────────────────────────────────────────────────────────────

function TonIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none">
      <circle cx="28" cy="28" r="28" fill="#0098EA" />
      <path d="M37.58 15.4H18.42c-3.49 0-5.67 3.79-3.92 6.79l11.5 19.52c.87 1.5 2.97 1.5 3.84 0l11.5-19.52c1.75-3-.43-6.79-3.84-6.79Z" fill="white" />
    </svg>
  );
}

function WalletIcon({ connected }: { connected: boolean }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="6" width="20" height="14" rx="3"
        stroke={connected ? "var(--accent)" : "currentColor"} strokeWidth="1.5" />
      <path d="M2 10h20" stroke={connected ? "var(--accent)" : "currentColor"} strokeWidth="1.5" />
      <circle cx="16" cy="15" r="1.25"
        fill={connected ? "var(--accent)" : "currentColor"} />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg width="6" height="11" viewBox="0 0 6 11" fill="none" style={{ flexShrink: 0 }}>
      <path d="M1 1l4 4.5L1 10" stroke="currentColor" strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Divider() {
  return <div className="h-px mx-4" style={{ background: "var(--border)" }} />;
}

// ── Countdown ──────────────────────────────────────────────────────────────────

function useCountdown(targetIso: string | null) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!targetIso) return;
    const update = () =>
      setSeconds(Math.max(0, Math.floor((new Date(targetIso).getTime() - Date.now()) / 1000)));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [targetIso]);
  return {
    seconds,
    h: Math.floor(seconds / 3600),
    m: Math.floor((seconds % 3600) / 60),
    s: seconds % 60,
  };
}

function pad(n: number) { return String(n).padStart(2, "0"); }

function pluralDays(n: number) {
  if (n % 10 === 1 && n % 100 !== 11) return "день";
  if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return "дня";
  return "дней";
}

// ── Row ────────────────────────────────────────────────────────────────────────

interface RowProps {
  icon: string;
  title: string;
  sub?: string;
  dot?: boolean;
  onClick?: () => void;
  right?: React.ReactNode;
  iconBg?: string;
}

function Row({ icon, title, sub, dot, onClick, right, iconBg }: RowProps) {
  const isButton = !!onClick;
  const Tag = isButton ? "button" : "div";

  return (
    <Tag
      {...(isButton ? { onClick } : {})}
      className={`w-full flex items-center gap-3 px-4 py-[14px] text-left${isButton ? " active:bg-white/[0.03] transition-colors" : ""}`}
    >
      {/* Icon */}
      <div
        className="w-10 h-10 rounded-[12px] flex items-center justify-center text-[19px] shrink-0"
        style={{ background: iconBg ?? "var(--bg-card-2)" }}
      >
        {icon}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-semibold text-white leading-tight">{title}</p>
        {sub && (
          <p className="text-[11px] mt-[3px]" style={{ color: "var(--text-dim)" }}>{sub}</p>
        )}
      </div>

      {/* Right slot */}
      {right}

      {/* Dot indicator */}
      {dot && (
        <span
          className="w-[7px] h-[7px] rounded-full shrink-0"
          style={{ background: "var(--accent)", boxShadow: "0 0 6px rgba(0,136,204,0.7)" }}
        />
      )}

      {/* Chevron */}
      {isButton && (
        <span style={{ color: "var(--text-muted)" }}>
          <ChevronIcon />
        </span>
      )}
    </Tag>
  );
}

// ══ ProfilePage ════════════════════════════════════════════════════════════════

export function ProfilePage() {
  const { profile, profileError } = useProfile();
  const { updateCoins } = useStore();

  const [showDonate, setShowDonate]       = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showReferrals, setShowReferrals] = useState(false);
  const [showTasks, setShowTasks]         = useState(false);
  const [tasksInfo, setTasksInfo]         = useState<TasksInfo | null>(null);

  const [tonConnectUI] = useTonConnectUI();
  const walletAddress  = useTonAddress();

  const [nextClaimAt, setNextClaimAt]   = useState<string | null>(null);
  const [claimLoading, setClaimLoading] = useState(false);
  const [justClaimed, setJustClaimed]   = useState(false);

  const { seconds, h, m, s } = useCountdown(nextClaimAt);
  const canClaim = seconds === 0;

  useEffect(() => {
    api.get<TasksInfo>("/tasks").then(setTasksInfo).catch(() => {});
  }, []);

  useEffect(() => {
    if (profile?.lastClaimAt) {
      setNextClaimAt(
        new Date(new Date(profile.lastClaimAt).getTime() + 24 * 3600 * 1000).toISOString()
      );
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

  function reloadTasks() {
    api.get<TasksInfo>("/tasks").then(setTasksInfo).catch(() => {});
  }

  // ── Loading / error ──────────────────────────────────────────────────────────
  if (!profile) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: "var(--bg)" }}>
        <div className="flex flex-col items-center gap-4">
          {profileError ? (
            <>
              <span className="text-4xl">⚠️</span>
              <p className="text-sm text-center px-8" style={{ color: "var(--text-dim)" }}>
                Не удалось подключиться.<br />Открой бота через Telegram.
              </p>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full border-2 animate-spin"
                style={{ borderColor: "transparent", borderTopColor: "var(--accent)" }} />
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>Загрузка...</p>
            </>
          )}
        </div>
      </div>
    );
  }

  const daysSince    = Math.floor((Date.now() - new Date(profile.createdAt).getTime()) / 86400000);
  const hasClaimable = tasksInfo?.tasks.some(t => t.status === "claimable") ?? false;
  const tasksDone    = tasksInfo ? `${tasksInfo.completedCount} / ${tasksInfo.totalCount}` : "0 / 18";

  return (
    <div className="min-h-screen pb-28" style={{ background: "var(--bg)" }}>

      {/* ── Topbar ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 pt-safe pt-5">
        {/* Left: empty placeholder */}
        <div className="w-9" />

        {/* Center: app name */}
        <span className="text-[13px] font-bold tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>
          Rolls
        </span>

        {/* Right: wallet */}
        <button
          onClick={() => walletAddress ? tonConnectUI.disconnect() : tonConnectUI.openModal()}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-all active:opacity-60"
          style={{
            background: walletAddress ? "rgba(0,136,204,0.1)" : "var(--bg-card)",
            border: `1px solid ${walletAddress ? "var(--accent-border)" : "var(--border)"}`,
            color: walletAddress ? "var(--accent)" : "var(--text-dim)",
          }}
        >
          <WalletIcon connected={!!walletAddress} />
        </button>
      </div>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col items-center pt-6 pb-7">

        {/* Avatar */}
        <div className="relative w-[92px] h-[92px]">
          {/* Glow */}
          <div
            className="absolute inset-0 rounded-full animate-avatar-glow"
            style={{ background: "var(--accent)", filter: "blur(18px)" }}
          />
          {/* Ring */}
          <div
            className="absolute inset-0 rounded-full"
            style={{ border: "1.5px solid rgba(255,255,255,0.15)", zIndex: 1 }}
          />
          {/* Photo */}
          <div className="relative w-full h-full rounded-full overflow-hidden" style={{ zIndex: 2 }}>
            <Avatar
              photoUrl={profile.photoUrl}
              firstName={profile.firstName}
              userId={profile.id}
              size={92}
            />
          </div>
        </div>

        {/* Name */}
        <p
          className="mt-4 text-[16px] font-semibold animate-count-in"
          style={{ color: "rgba(255,255,255,0.75)", animationDelay: "0.1s" }}
        >
          {profile.username ? `@${profile.username}` : profile.firstName}
        </p>

        {/* Coin balance */}
        <div
          className="flex items-center gap-2 mt-3 animate-count-in"
          style={{ animationDelay: "0.18s" }}
        >
          <span style={{ fontSize: 28 }}>🪙</span>
          <span className="font-black text-white" style={{ fontSize: 36, lineHeight: 1 }}>
            {profile.coins.toLocaleString()}
          </span>
        </div>

        {/* Top-up button */}
        <button
          onClick={() => setShowDonate(true)}
          className="mt-4 px-6 py-[9px] rounded-full text-[13px] font-bold btn-primary animate-count-in"
          style={{ animationDelay: "0.26s" }}
        >
          Пополнить
        </button>
      </div>

      {/* ── Cards ───────────────────────────────────────────────────────────── */}
      <div className="px-4 flex flex-col gap-[10px]">

        {/* Actions */}
        <div
          className="rounded-[22px] overflow-hidden animate-fade-up"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)", animationDelay: "0.1s" }}
        >
          <Row
            icon="🎁"
            title="Инвентарь"
            sub="0 предметов"
            onClick={() => setShowInventory(true)}
          />
          <Divider />
          <Row
            icon="📋"
            title="Задания"
            sub={tasksDone}
            dot={hasClaimable}
            onClick={() => setShowTasks(true)}
          />
          <Divider />
          <Row
            icon="💎"
            title="Рефералы"
            sub="10% с каждого друга"
            onClick={() => setShowReferrals(true)}
          />
        </div>

        {/* Status */}
        <div
          className="rounded-[22px] overflow-hidden animate-fade-up"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)", animationDelay: "0.18s" }}
        >
          {/* Daily claim */}
          <div className="flex items-center gap-3 px-4 py-[14px]">
            <div
              className="w-10 h-10 rounded-[12px] flex items-center justify-center text-[19px] shrink-0"
              style={{ background: canClaim ? "rgba(0,136,204,0.13)" : "var(--bg-card-2)" }}
            >
              {justClaimed ? "✨" : canClaim ? "🎁" : "⏳"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-white leading-tight">Ежедневный клейм</p>
              {!canClaim && !justClaimed ? (
                <p className="text-[11px] font-mono mt-[3px]" style={{ color: "var(--accent)" }}>
                  {pad(h)}:{pad(m)}:{pad(s)}
                </p>
              ) : (
                <p className="text-[11px] mt-[3px]" style={{ color: "var(--text-dim)" }}>+100 монет</p>
              )}
            </div>
            <button
              onClick={handleClaim}
              disabled={!canClaim || claimLoading}
              className={`shrink-0 px-3.5 py-[7px] rounded-[10px] text-[12px] font-bold transition-all disabled:opacity-35${canClaim && !claimLoading ? " animate-pulse-accent" : ""}`}
              style={canClaim
                ? { background: "var(--accent)", color: "#fff" }
                : { background: "var(--bg-card-2)", color: "var(--text-dim)" }
              }
            >
              {claimLoading ? "..." : canClaim ? "Забрать" : "Ждать"}
            </button>
          </div>

          <Divider />

          {/* Days in game */}
          <Row
            icon="🔥"
            title="В игре"
            sub={`${daysSince} ${pluralDays(daysSince)}`}
          />

          <Divider />

          {/* TON donated */}
          <Row
            icon="💙"
            title="TON донат"
            sub={`${profile.totalDonatedTon.toFixed(2)} TON`}
            iconBg="rgba(0,136,204,0.1)"
          />
        </div>
      </div>

      {/* ── Modals ──────────────────────────────────────────────────────────── */}
      {showDonate    && <DonateModal    onClose={() => setShowDonate(false)} />}
      {showInventory && <InventoryModal onClose={() => setShowInventory(false)} />}
      {showReferrals && <ReferralsModal onClose={() => setShowReferrals(false)} />}
      {showTasks     && (
        <TasksModal onClose={() => { setShowTasks(false); reloadTasks(); }} />
      )}
    </div>
  );
}
