import { useState, useEffect } from "react";
import { useTonConnectUI, useTonAddress } from "@tonconnect/ui-react";
import { Avatar } from "@/components/profile/Avatar";
import { DonateModal } from "@/components/profile/DonateModal";
import { InventoryModal } from "@/components/profile/InventoryModal";
import { ReferralsModal } from "@/components/profile/ReferralsModal";
import { SettingsModal } from "@/components/profile/SettingsModal";
import { TasksModal } from "@/components/profile/TasksModal";
import { useProfile } from "@/hooks/useProfile";
import { api } from "@/api/client";
import type { TasksInfo } from "@roulette/shared";
import { AlertIcon } from "@/components/ui/icons";

// ── Icons ──────────────────────────────────────────────────────────────────────

function TonIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none">
      <circle cx="28" cy="28" r="28" fill="#0098EA" />
      <path d="M37.58 15.4H18.42c-3.49 0-5.67 3.79-3.92 6.79l11.5 19.52c.87 1.5 2.97 1.5 3.84 0l11.5-19.52c1.75-3-.43-6.79-3.84-6.79Z" fill="white" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  );
}

function ClipboardIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 2H7a2 2 0 00-2 2v16a2 2 0 002 2h10a2 2 0 002-2V4a2 2 0 00-2-2h-2" />
      <rect x="9" y="2" width="6" height="4" rx="1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4CD964" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12l5 5L19 7" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg width="6" height="11" viewBox="0 0 6 11" fill="none">
      <path d="M1 1l4 4.5L1 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function WalletIcon({ connected }: { connected: boolean }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="6" width="20" height="14" rx="3"
        stroke={connected ? "var(--accent)" : "currentColor"} strokeWidth="1.5" />
      <path d="M2 10h20" stroke={connected ? "var(--accent)" : "currentColor"} strokeWidth="1.5" />
      <circle cx="16" cy="15" r="1.25" fill={connected ? "var(--accent)" : "currentColor"} />
    </svg>
  );
}

function Divider() {
  return <div className="h-px mx-4" style={{ background: "var(--border)" }} />;
}

// ── Row ────────────────────────────────────────────────────────────────────────

interface RowProps {
  icon: string;
  title: string;
  badge?: React.ReactNode;
  dot?: boolean;
  onClick: () => void;
}

function Row({ icon, title, badge, dot, onClick }: RowProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-[15px] text-left transition-colors active:bg-white/[0.03]"
    >
      <span style={{ fontSize: 22, lineHeight: 1 }}>{icon}</span>
      <span className="flex-1 text-[14px] font-semibold text-white leading-tight">{title}</span>
      {badge}
      {dot && (
        <span
          className="w-[7px] h-[7px] rounded-full shrink-0"
          style={{ background: "var(--accent)", boxShadow: "0 0 6px rgba(0,136,204,0.7)" }}
        />
      )}
      <span style={{ color: "var(--text-muted)" }}><ChevronIcon /></span>
    </button>
  );
}

// ══ ProfilePage ════════════════════════════════════════════════════════════════

export function ProfilePage() {
  const { profile, profileError } = useProfile();

  const [showDonate,    setShowDonate]    = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showReferrals, setShowReferrals] = useState(false);
  const [showTasks,     setShowTasks]     = useState(false);
  const [showSettings,  setShowSettings]  = useState(false);
  const [tasksInfo,     setTasksInfo]     = useState<TasksInfo | null>(null);
  const [copied,        setCopied]        = useState(false);

  const [tonConnectUI] = useTonConnectUI();
  const walletAddress  = useTonAddress();

  useEffect(() => {
    api.get<TasksInfo>("/tasks").then(setTasksInfo).catch(() => {});
  }, []);

  function reloadTasks() {
    api.get<TasksInfo>("/tasks").then(setTasksInfo).catch(() => {});
  }

  function handleCopy() {
    const text = walletAddress || "";
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  // ── Loading / error ──────────────────────────────────────────────────────────
  if (!profile) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: "var(--bg)" }}>
        <div className="flex flex-col items-center gap-4">
          {profileError ? (
            <>
              <span style={{ color: "#f87171" }}><AlertIcon size={44} /></span>
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

  const hasClaimable = tasksInfo?.tasks.some(t => t.status === "claimable") ?? false;
  const tasksDone    = tasksInfo ? `${tasksInfo.completedCount} / ${tasksInfo.totalCount}` : "…";

  return (
    <div className="min-h-screen pb-28" style={{ background: "var(--bg)" }}>

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-4 pt-5">

        {/* Left: 🌸 + gift count */}
        <button
          onClick={() => setShowInventory(true)}
          className="flex items-center gap-1.5 px-3 py-[7px] rounded-full transition-all active:opacity-60"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
        >
          <span style={{ fontSize: 15 }}>🌸</span>
          <span className="text-[13px] font-bold text-white">{profile.giftCount}</span>
        </button>

        {/* Right: settings */}
        <button
          onClick={() => setShowSettings(true)}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-all active:opacity-60"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            color: "var(--text-dim)",
          }}
        >
          <GearIcon />
        </button>
      </div>

      {/* ── Avatar + username ── */}
      <div className="flex flex-col items-center pt-5 pb-5">
        <div
          className="w-[88px] h-[88px] rounded-full overflow-hidden"
          style={{ boxShadow: "0 0 0 1.5px rgba(255,255,255,0.1)" }}
        >
          <Avatar
            photoUrl={profile.photoUrl}
            firstName={profile.firstName}
            userId={profile.id}
            size={88}
          />
        </div>
        <p className="mt-3 text-[15px] font-semibold" style={{ color: "rgba(255,255,255,0.7)" }}>
          {profile.username ? `@${profile.username}` : profile.firstName}
        </p>
      </div>

      {/* ── Balance card ── */}
      <div className="px-4 mb-3">
        <div
          className="rounded-[20px] overflow-hidden"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
        >
          {/* Top row: label + amount + buttons */}
          <div className="flex items-center gap-3 px-4 pt-4 pb-4">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-[0.12em] mb-1.5" style={{ color: "var(--text-muted)" }}>
                Баланс
              </p>
              <div className="flex items-center gap-2">
                <TonIcon size={22} />
                <span className="text-[20px] font-black text-white leading-none">
                  {profile.totalDonatedTon.toFixed(2)} TON
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setShowDonate(true)}
                className="px-4 py-2 rounded-[12px] text-[13px] font-bold transition-all active:scale-95"
                style={{ background: "var(--accent)", color: "#fff", boxShadow: "0 2px 12px rgba(0,136,204,0.3)" }}
              >
                Пополнить
              </button>
              <button
                onClick={handleCopy}
                disabled={!walletAddress}
                className="w-9 h-9 rounded-[12px] flex items-center justify-center transition-all active:scale-90 disabled:opacity-30"
                style={{
                  background: copied ? "rgba(76,217,100,0.14)" : "var(--bg-card-2)",
                  color: copied ? "#4CD964" : "var(--text-dim)",
                }}
              >
                {copied ? <CheckIcon /> : <ClipboardIcon />}
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px mx-0" style={{ background: "var(--border)" }} />

          {/* Bottom row: wallet */}
          <button
            onClick={() => walletAddress ? tonConnectUI.disconnect() : tonConnectUI.openModal()}
            className="w-full flex items-center gap-2.5 px-4 py-3 transition-colors active:bg-white/[0.03]"
          >
            <span style={{ color: walletAddress ? "var(--accent)" : "var(--text-muted)" }}>
              <WalletIcon connected={!!walletAddress} />
            </span>
            {walletAddress ? (
              <>
                <span className="text-[12px] font-mono flex-1 text-left truncate" style={{ color: "rgba(255,255,255,0.45)" }}>
                  {walletAddress.slice(0, 8)}…{walletAddress.slice(-6)}
                </span>
                <span className="text-[11px] font-semibold shrink-0" style={{ color: "#FF3B30" }}>
                  Отключить
                </span>
              </>
            ) : (
              <span className="text-[13px] font-semibold" style={{ color: "var(--text-dim)" }}>
                Подключить кошелёк
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── Action rows ── */}
      <div className="px-4">
        <div
          className="rounded-[22px] overflow-hidden"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
        >
          <Row
            icon="🎁"
            title="Инвентарь подарков"
            badge={
              <span
                className="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
                style={{ background: "rgba(255,59,48,0.18)", color: "#FF3B30" }}
              >
                {profile.giftCount}
              </span>
            }
            onClick={() => setShowInventory(true)}
          />
          <Divider />
          <Row
            icon="📋"
            title="Задания"
            badge={
              <span
                className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                style={{ background: "rgba(245,200,66,0.15)", color: "var(--gold)" }}
              >
                {tasksDone}
              </span>
            }
            dot={hasClaimable}
            onClick={() => setShowTasks(true)}
          />
          <Divider />
          <Row
            icon="💎"
            title="Рефералы"
            onClick={() => setShowReferrals(true)}
          />
          <Divider />
          <Row
            icon="🥇"
            title="Стейкинг"
            onClick={() => setShowInventory(true)}
          />
        </div>
      </div>

      {/* ── Modals ── */}
      {showDonate    && <DonateModal    onClose={() => setShowDonate(false)} />}
      {showInventory && <InventoryModal onClose={() => setShowInventory(false)} />}
      {showReferrals && <ReferralsModal onClose={() => setShowReferrals(false)} />}
      {showTasks     && <TasksModal     onClose={() => { setShowTasks(false); reloadTasks(); }} />}
      {showSettings  && <SettingsModal  onClose={() => setShowSettings(false)} />}
    </div>
  );
}
