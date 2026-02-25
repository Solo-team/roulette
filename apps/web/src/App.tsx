import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import { ProfilePage } from "@/pages/ProfilePage";
import { LeaderboardPage } from "@/pages/LeaderboardPage";
import { ShopPage } from "@/pages/ShopPage";

const MANIFEST_URL = "https://roulette-kz79.vercel.app/tonconnect-manifest.json";

export function App() {
  return (
    <TonConnectUIProvider manifestUrl={MANIFEST_URL}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ProfilePage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/shop" element={<ShopPage />} />
        </Routes>

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
            className="flex-1 flex flex-col items-center py-3 gap-1 transition-all"
            style={({ isActive }) => ({
              color: isActive ? "var(--gold)" : "rgba(255,255,255,0.3)",
            })}
          >
            {({ isActive }) => (
              <>
                <span
                  className="text-xl transition-transform"
                  style={{ transform: isActive ? "scale(1.15)" : "scale(1)" }}
                >
                  👤
                </span>
                <span
                  className="text-[10px] font-semibold tracking-wide"
                  style={{ color: isActive ? "var(--gold)" : "rgba(255,255,255,0.3)" }}
                >
                  Профиль
                </span>
                {isActive && (
                  <span
                    className="absolute bottom-0 w-8 h-0.5 rounded-full"
                    style={{ background: "linear-gradient(90deg, #F5C842, #C8960C)" }}
                  />
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
                <span
                  className="text-xl transition-transform"
                  style={{ transform: isActive ? "scale(1.15)" : "scale(1)" }}
                >
                  🏆
                </span>
                <span
                  className="text-[10px] font-semibold tracking-wide"
                  style={{ color: isActive ? "var(--gold)" : "rgba(255,255,255,0.3)" }}
                >
                  Топ
                </span>
                {isActive && (
                  <span
                    className="absolute bottom-0 w-8 h-0.5 rounded-full"
                    style={{ background: "linear-gradient(90deg, #F5C842, #C8960C)" }}
                  />
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
                <span
                  className="text-xl transition-transform"
                  style={{ transform: isActive ? "scale(1.15)" : "scale(1)" }}
                >
                  🛍️
                </span>
                <span
                  className="text-[10px] font-semibold tracking-wide"
                  style={{ color: isActive ? "var(--accent)" : "rgba(255,255,255,0.3)" }}
                >
                  Магазин
                </span>
                {isActive && (
                  <span
                    className="absolute bottom-0 w-8 h-0.5 rounded-full"
                    style={{ background: "linear-gradient(90deg, #0088CC, #005fa3)" }}
                  />
                )}
              </>
            )}
          </NavLink>
        </nav>
      </BrowserRouter>
    </TonConnectUIProvider>
  );
}
