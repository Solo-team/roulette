import { useState, useEffect, useCallback } from "react";
import { useTgBack } from "@/hooks/useTgBack";
import { api } from "@/api/client";
import { useStore } from "@/store/index";
import type { TasksInfo, TaskItem, TaskStatus, TaskClaimResult } from "@roulette/shared";
import { CoinIcon, LockIcon, TaskIcon } from "@/components/ui/icons";

// ── Цвета категорий ───────────────────────────────────────────────────────────
const CATEGORY_LABEL: Record<string, string> = {
  start:    "Старт",
  daily:    "Ежедневные",
  referral: "Рефералы",
  donate:   "Донаты",
  game:     "Игра",
};

// ── Статусный бейдж ───────────────────────────────────────────────────────────
function StatusBadge({ status, reward }: { status: TaskStatus; reward: number }) {
  if (status === "claimed") {
    return (
      <span className="text-[11px] font-bold px-2.5 py-1 rounded-[8px]"
        style={{ background: "rgba(76,217,100,0.12)", color: "#4CD964" }}>
        ✓ Получено
      </span>
    );
  }
  if (status === "locked") {
    return (
      <span className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-[8px]"
        style={{ background: "rgba(255,255,255,0.05)", color: "var(--text-muted)" }}>
        <LockIcon size={11} /> Скоро
      </span>
    );
  }
  if (status === "claimable") {
    return (
      <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-[8px]"
        style={{ background: "rgba(0,136,204,0.18)", color: "var(--accent)" }}>
        +{reward.toLocaleString()} <CoinIcon size={11} />
      </span>
    );
  }
  // unclaimed
  return (
    <span className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-[8px]"
      style={{ background: "rgba(255,255,255,0.05)", color: "var(--text-dim)" }}>
      +{reward.toLocaleString()} <CoinIcon size={11} />
    </span>
  );
}

// ── Одно задание ──────────────────────────────────────────────────────────────
function TaskRow({ task, onClaim }: { task: TaskItem; onClaim: (id: string) => Promise<void> }) {
  const [loading, setLoading] = useState(false);

  async function handleClaim() {
    setLoading(true);
    await onClaim(task.id);
    setLoading(false);
  }

  const dim = task.status === "locked" || task.status === "claimed";

  return (
    <div
      className="flex items-center gap-3 px-4 py-[13px]"
      style={{ opacity: dim ? 0.55 : 1, transition: "opacity .2s" }}
    >
      <div
        className="w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0"
        style={{
          background: task.status === "claimable" ? "rgba(0,136,204,0.14)" : "var(--bg-card-2)",
          color: task.status === "claimable" ? "var(--accent)" : "var(--text-dim)",
        }}
      >
        <TaskIcon emoji={task.icon} size={20} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-white leading-tight">{task.title}</p>
        <p className="text-[11px] mt-0.5 truncate" style={{ color: "var(--text-dim)" }}>
          {task.description}
        </p>
      </div>

      {task.status === "claimable" ? (
        <button
          onClick={handleClaim}
          disabled={loading}
          className="shrink-0 px-3.5 py-2 rounded-[10px] text-[12px] font-bold transition-all active:scale-95 disabled:opacity-50"
          style={{ background: "var(--accent)", color: "#fff", boxShadow: "0 2px 8px rgba(0,136,204,0.3)" }}
        >
          {loading ? "..." : "Забрать"}
        </button>
      ) : (
        <StatusBadge status={task.status} reward={task.reward} />
      )}
    </div>
  );
}

// ── TasksModal ────────────────────────────────────────────────────────────────
interface Props {
  onClose: () => void;
}

export function TasksModal({ onClose }: Props) {
  useTgBack(onClose);
  const { updateCoins } = useStore();
  const [data, setData]             = useState<TasksInfo | null>(null);
  const [activeCategory, setActive] = useState<string>("all");

  const load = useCallback(() => {
    api.get<TasksInfo>("/tasks").then(setData).catch(() => {});
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleClaim(taskId: string) {
    try {
      const result = await api.post<TaskClaimResult>(`/tasks/${taskId}/claim`);
      updateCoins(result.coins);
      load(); // обновить список
    } catch { /* handled */ }
  }

  const categories = data
    ? ["all", ...Array.from(new Set(data.tasks.map(t => t.category)))]
    : ["all"];

  const visible = data?.tasks.filter(t =>
    activeCategory === "all" || t.category === activeCategory
  ) ?? [];

  // Группируем: сначала claimable, затем unclaimed, locked, claimed
  const order: Record<TaskStatus, number> = { claimable: 0, unclaimed: 1, locked: 2, claimed: 3 };
  const sorted = [...visible].sort((a, b) => order[a.status] - order[b.status]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "var(--bg)" }}>

      {/* ── Header ── */}
      <div className="flex-shrink-0 flex items-center gap-3 px-4 pt-5 pb-1">
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-all active:opacity-60"
          style={{ background: "var(--bg-card)", color: "var(--text-dim)" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <h2 className="text-[17px] font-bold text-white">Задания</h2>
      </div>

      {/* ── Прогресс ─────────────────────────────────────────────────────── */}
      {data && (
        <div className="px-4 pt-4 pb-3 shrink-0">
          <div className="flex justify-between text-[11px] mb-1.5">
            <span style={{ color: "var(--text-muted)" }}>Прогресс</span>
            <span style={{ color: "var(--text-dim)" }}>{data.completedCount} / {data.totalCount}</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-card-2)" }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(data.completedCount / data.totalCount) * 100}%`,
                background: "linear-gradient(90deg, var(--accent), #00c2ff)",
              }}
            />
          </div>
        </div>
      )}

      {/* ── Фильтры по категориям ──────────────────────────────────────────── */}
      <div className="px-4 pb-3 shrink-0 flex gap-2 overflow-x-auto scrollbar-none">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className="shrink-0 px-3.5 py-1.5 rounded-[10px] text-[12px] font-semibold transition-all"
            style={activeCategory === cat
              ? { background: "var(--accent)", color: "#fff" }
              : { background: "var(--bg-card-2)", color: "var(--text-dim)" }
            }
          >
            {cat === "all" ? "Все" : CATEGORY_LABEL[cat] ?? cat}
          </button>
        ))}
      </div>

      {/* ── Список ────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        {!data ? (
          <div className="flex justify-center pt-12">
            <div className="w-8 h-8 rounded-full border-2 animate-spin"
              style={{ borderColor: "transparent", borderTopColor: "var(--accent)" }} />
          </div>
        ) : (
          <div
            className="rounded-[20px] overflow-hidden"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            {sorted.map((task, i) => (
              <div key={task.id}>
                <TaskRow task={task} onClaim={handleClaim} />
                {i < sorted.length - 1 && (
                  <div className="h-px mx-4" style={{ background: "var(--border)" }} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
