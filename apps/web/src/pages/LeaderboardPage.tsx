import { useEffect } from "react";
import { api } from "@/api/client";
import { useStore } from "@/store/index";
import { LeaderboardTable } from "@/components/leaderboard/LeaderboardTable";
import type { LeaderboardEntry } from "@roulette/shared";
import { TrophyIcon } from "@/components/ui/icons";

const DEV_MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, id: "1", firstName: "Дмитрий",  username: "dmitry_pro",   photoUrl: null, coins: 98400 },
  { rank: 2, id: "2", firstName: "Анна",      username: "anna_lucky",   photoUrl: null, coins: 76200 },
  { rank: 3, id: "3", firstName: "Сергей",    username: "sergey_win",   photoUrl: null, coins: 61500 },
  { rank: 4, id: "4", firstName: "Ольга",     username: null,           photoUrl: null, coins: 48900 },
  { rank: 5, id: "123456789", firstName: "Алексей", username: "alexey_dev", photoUrl: null, coins: 24750 },
  { rank: 6, id: "6", firstName: "Максим",    username: "max_spin",     photoUrl: null, coins: 19300 },
  { rank: 7, id: "7", firstName: "Екатерина", username: null,           photoUrl: null, coins: 15800 },
  { rank: 8, id: "8", firstName: "Иван",      username: "ivan_roll",    photoUrl: null, coins: 12400 },
  { rank: 9, id: "9", firstName: "Наталья",   username: null,           photoUrl: null, coins: 9700  },
  { rank: 10, id: "10", firstName: "Виктор",  username: "viktor_g",     photoUrl: null, coins: 7200  },
];

export function LeaderboardPage() {
  const { profile, leaderboard, setLeaderboard } = useStore();

  useEffect(() => {
    api
      .get<LeaderboardEntry[]>("/leaderboard")
      .then(setLeaderboard)
      .catch(() => {
        if (import.meta.env.DEV && leaderboard.length === 0) {
          setLeaderboard(DEV_MOCK_LEADERBOARD);
        }
      });
  }, []);

  return (
    <div className="min-h-screen pb-24 relative" style={{ background: "var(--bg)" }}>
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-40 rounded-full"
          style={{ background: "radial-gradient(ellipse, rgba(245,200,66,0.07) 0%, transparent 70%)" }} />
      </div>

      {/* Header */}
      <div className="px-4 pt-10 pb-5 animate-fade-up">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #F5C842, #C8960C)", boxShadow: "0 4px 14px rgba(245,200,66,0.3)", color: "#fff" }}>
            <TrophyIcon size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold leading-none">Топ-100</h1>
            <p className="text-white/30 text-xs mt-0.5">Лучшие игроки рулетки</p>
          </div>
        </div>
      </div>

      <div className="px-4">
        {leaderboard.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-2 border-yellow-400/30 border-t-yellow-400 animate-spin" />
            </div>
            <p className="text-white/25 text-sm">Загрузка таблицы...</p>
          </div>
        ) : (
          <LeaderboardTable entries={leaderboard} currentUserId={profile?.id ?? ""} />
        )}
      </div>
    </div>
  );
}
