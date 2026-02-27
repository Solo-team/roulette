import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import { ProfilePage } from "@/pages/ProfilePage";
import { LeaderboardPage } from "@/pages/LeaderboardPage";
import { ShopPage } from "@/pages/ShopPage";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const MANIFEST_URL = "https://roulette-kz79.vercel.app/tonconnect-manifest.json";

function IconProfile({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.6} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}

function IconLeaderboard({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.6} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="13" width="5" height="8" rx="1" />
      <rect x="9.5" y="8" width="5" height="13" rx="1" />
      <rect x="17" y="3" width="5" height="18" rx="1" />
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

export function App() {
  return (
    <TonConnectUIProvider manifestUrl={MANIFEST_URL}>
      <BrowserRouter>
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<ProfilePage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/shop" element={<ShopPage />} />
          </Routes>
        </ErrorBoundary>

        {/* Bottom nav */}
        <nav
          className="fixed bottom-0 left-0 right-0 flex z-40"
          style={{
            background: "rgba(8,8,16,0.92)",
            backdropFilter: "blur(20px)",
            borderTop: "1px solid rgba(255,255,255,0.07)",
            paddingBottom: "env(safe-area-inset-bottom, 0px)",
          }}
        >
          <NavLink
            to="/"
            end
            className="flex-1 flex flex-col items-center py-3 gap-1 relative transition-all"
            style={({ isActive }) => ({
              color: isActive ? "var(--gold)" : "rgba(255,255,255,0.3)",
            })}
          >
            {({ isActive }) => (
              <>
                <span className="transition-transform" style={{ transform: isActive ? "scale(1.12)" : "scale(1)" }}>
                  <IconProfile active={isActive} />
                </span>
                <span className="text-[10px] font-semibold tracking-wide" style={{ color: isActive ? "var(--gold)" : "rgba(255,255,255,0.3)" }}>
                  Профиль
                </span>
                {isActive && (
                  <span className="absolute bottom-0 w-8 h-0.5 rounded-full" style={{ background: "linear-gradient(90deg, #F5C842, #C8960C)" }} />
                )}
              </>
            )}
          </NavLink>

          <NavLink
            to="/leaderboard"
            className="flex-1 flex flex-col items-center py-3 gap-1 relative transition-all"
            style={({ isActive }) => ({
              color: isActive ? "var(--gold)" : "rgba(255,255,255,0.3)",
            })}
          >
            {({ isActive }) => (
              <>
                <span className="transition-transform" style={{ transform: isActive ? "scale(1.12)" : "scale(1)" }}>
                  <IconLeaderboard active={isActive} />
                </span>
                <span className="text-[10px] font-semibold tracking-wide" style={{ color: isActive ? "var(--gold)" : "rgba(255,255,255,0.3)" }}>
                  Топ
                </span>
                {isActive && (
                  <span className="absolute bottom-0 w-8 h-0.5 rounded-full" style={{ background: "linear-gradient(90deg, #F5C842, #C8960C)" }} />
                )}
              </>
            )}
          </NavLink>

          <NavLink
            to="/shop"
            className="flex-1 flex flex-col items-center py-3 gap-1 relative transition-all"
            style={({ isActive }) => ({
              color: isActive ? "var(--accent)" : "rgba(255,255,255,0.3)",
            })}
          >
            {({ isActive }) => (
              <>
                <span className="transition-transform" style={{ transform: isActive ? "scale(1.12)" : "scale(1)" }}>
                  <IconShop active={isActive} />
                </span>
                <span className="text-[10px] font-semibold tracking-wide" style={{ color: isActive ? "var(--accent)" : "rgba(255,255,255,0.3)" }}>
                  Магазин
                </span>
                {isActive && (
                  <span className="absolute bottom-0 w-8 h-0.5 rounded-full" style={{ background: "linear-gradient(90deg, #0088CC, #005fa3)" }} />
                )}
              </>
            )}
          </NavLink>
        </nav>
      </BrowserRouter>
    </TonConnectUIProvider>
  );
}
