import type { LeaderboardEntry } from "@roulette/shared";
import { Avatar } from "@/components/profile/Avatar";

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  currentUserId: string;
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return (
    <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0"
      style={{ background: "linear-gradient(135deg, #FFD700, #FFA500)", boxShadow: "0 2px 10px rgba(255,215,0,0.4)", color: "#3d2000" }}>
      1
    </div>
  );
  if (rank === 2) return (
    <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0"
      style={{ background: "linear-gradient(135deg, #E8E8E8, #B0B0B0)", color: "#222" }}>
      2
    </div>
  );
  if (rank === 3) return (
    <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0"
      style={{ background: "linear-gradient(135deg, #CD7F32, #8B4513)", color: "#fff" }}>
      3
    </div>
  );
  return (
    <div className="w-8 text-center font-bold text-white/25 text-sm flex-shrink-0">
      {rank}
    </div>
  );
}

export function LeaderboardTable({ entries, currentUserId }: LeaderboardTableProps) {
  return (
    <div className="flex flex-col gap-1.5 pb-4">
      {entries.map((entry, i) => {
        const isMe = entry.id === currentUserId;
        const isTop3 = entry.rank <= 3;
        return (
          <div
            key={entry.id}
            className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl animate-fade-up ${
              isMe
                ? "glass-gold"
                : isTop3
                ? "glass border-yellow-400/15"
                : "glass"
            }`}
            style={{ animationDelay: `${Math.min(i * 0.025, 0.5)}s` }}
          >
            <RankBadge rank={entry.rank} />

            <div className="relative flex-shrink-0">
              {isTop3 && (
                <div className="absolute -inset-0.5 rounded-full"
                  style={{ background: entry.rank === 1 ? "linear-gradient(135deg,#FFD700,#FFA500)" : entry.rank === 2 ? "linear-gradient(135deg,#C0C0C0,#888)" : "linear-gradient(135deg,#CD7F32,#8B4513)", filter: "blur(2px)", opacity: 0.6 }} />
              )}
              <div className={isTop3 ? "relative rounded-full p-0.5" : ""} style={isTop3 ? { background: entry.rank === 1 ? "linear-gradient(135deg,#FFD700,#FFA500)" : entry.rank === 2 ? "linear-gradient(135deg,#C0C0C0,#888)" : "linear-gradient(135deg,#CD7F32,#8B4513)" } : {}}>
                <Avatar photoUrl={entry.photoUrl} firstName={entry.firstName} userId={entry.id} size={38} />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <p className={`font-semibold text-sm truncate leading-tight ${isMe ? "" : "text-white"}`}
                style={isMe ? { color: "var(--gold-light)" } : {}}>
                {entry.firstName}
                {isMe && <span className="ml-1.5 text-[10px] font-normal opacity-70">← ты</span>}
              </p>
              {entry.username && (
                <p className="text-white/25 text-xs truncate">@{entry.username}</p>
              )}
            </div>

            <div className="flex-shrink-0 text-right">
              <p className="text-shimmer font-bold text-sm">{entry.coins.toLocaleString()}</p>
              <p className="text-white/20 text-[10px]">монет</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
