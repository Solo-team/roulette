import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import { ProfilePage } from "@/pages/ProfilePage";
import { LeaderboardPage } from "@/pages/LeaderboardPage";
import { ShopPage } from "@/pages/ShopPage";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const MANIFEST_URL = "https://roulette-kz79.vercel.app/tonconnect-manifest.json";

// ── Placeholder pages ──────────────────────────────────────────────────────────

function ComingSoonPage({ emoji, title }: { emoji: string; title: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center pb-28"
      style={{ background: "var(--bg)", minHeight: "100dvh" }}
    >
      <span style={{ fontSize: 56 }}>{emoji}</span>
      <p className="mt-4 text-[20px] font-bold text-white">{title}</p>
      <p className="mt-2 text-[13px]" style={{ color: "var(--text-dim)" }}>Скоро будет доступно</p>
    </div>
  );
}

// ── Nav icons ─────────────────────────────────────────────────────────────────

function IconPvp({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 17.5L3 6V3h3l11.5 11.5" />
      <path d="M13 19l6-6" />
      <path d="M2 2l20 20" opacity="0" />
      <path d="M16 3h3v3L8.5 16.5" />
      <path d="M5 19l6-6" />
    </svg>
  );
}

function IconSolo({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.6} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="18" rx="2" />
      <line x1="8" y1="3" x2="8" y2="21" />
      <line x1="16" y1="3" x2="16" y2="21" />
      <line x1="2" y1="12" x2="22" y2="12" />
    </svg>
  );
}

function IconGiveaways({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.6} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 12 20 22 4 22 4 12" />
      <rect x="2" y="7" width="20" height="5" />
      <line x1="12" y1="22" x2="12" y2="7" />
      <path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z" />
      <path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" />
    </svg>
  );
}

function IconShop({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  );
}

function IconProfile({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.6} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}

// ── Nav item ──────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { to: "/pvp",       label: "ПвП",        Icon: IconPvp,       activeColor: "var(--accent)" },
  { to: "/solo",      label: "Соло",       Icon: IconSolo,      activeColor: "var(--accent)" },
  { to: "/giveaways", label: "Розыгрыши",  Icon: IconGiveaways, activeColor: "var(--accent)" },
  { to: "/shop",      label: "Магазин",    Icon: IconShop,      activeColor: "var(--accent)" },
  { to: "/",          label: "Профиль",    Icon: IconProfile,   activeColor: "#ffffff",       end: true },
];

// ── App ───────────────────────────────────────────────────────────────────────

export function App() {
  return (
    <TonConnectUIProvider manifestUrl={MANIFEST_URL}>
      <BrowserRouter>
        <ErrorBoundary>
          <Routes>
            <Route path="/"          element={<ProfilePage />} />
            <Route path="/shop"      element={<ShopPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/pvp"       element={<ComingSoonPage emoji="⚔️" title="ПвП" />} />
            <Route path="/solo"      element={<ComingSoonPage emoji="🎰" title="Соло" />} />
            <Route path="/giveaways" element={<ComingSoonPage emoji="🎁" title="Розыгрыши" />} />
          </Routes>
        </ErrorBoundary>

        {/* ── Bottom nav ── */}
        <nav
          className="fixed bottom-0 left-0 right-0 flex z-40"
          style={{
            background: "rgba(8,8,16,0.96)",
            backdropFilter: "blur(20px)",
            borderTop: "1px solid rgba(255,255,255,0.07)",
            paddingBottom: "env(safe-area-inset-bottom, 0px)",
          }}
        >
          {NAV_ITEMS.map(({ to, label, Icon, activeColor, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className="flex-1 flex flex-col items-center py-3 gap-[3px] relative transition-all"
            >
              {({ isActive }) => (
                <>
                  <span
                    className="transition-transform"
                    style={{
                      color: isActive ? activeColor : "rgba(255,255,255,0.28)",
                      transform: isActive ? "scale(1.1)" : "scale(1)",
                    }}
                  >
                    <Icon active={isActive} />
                  </span>
                  <span
                    className="text-[10px] font-semibold tracking-wide"
                    style={{ color: isActive ? activeColor : "rgba(255,255,255,0.28)" }}
                  >
                    {label}
                  </span>
                  {isActive && (
                    <span
                      className="absolute bottom-0 w-8 h-0.5 rounded-full"
                      style={{ background: activeColor, opacity: 0.7 }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </BrowserRouter>
    </TonConnectUIProvider>
  );
}
