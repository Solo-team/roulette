import { prisma } from "../lib/prisma.js";
import type { TaskItem, TaskCategory, TaskStatus, TasksInfo, TaskClaimResult } from "@roulette/shared";

// ── Статические определения 18 заданий ───────────────────────────────────────

interface TaskDef {
  id:          string;
  title:       string;
  description: string;
  reward:      number;
  icon:        string;
  category:    TaskCategory;
  /** Проверка выполнения по данным пользователя (undefined = нет данных → locked) */
  check?: (ctx: TaskContext) => boolean;
}

interface TaskContext {
  walletAddress:    string | null;
  lastClaimAt:      Date | null;
  totalDonatedTon:  number;
  referralCount:    number;
}

const TASK_DEFS: TaskDef[] = [
  // ── Старт ─────────────────────────────────────────────────────────────────
  {
    id: "join", title: "Добро пожаловать",
    description: "Открой приложение первый раз",
    reward: 50, icon: "👋", category: "start",
    check: () => true,
  },
  {
    id: "wallet", title: "Привяжи кошелёк",
    description: "Подключи TON-кошелёк к профилю",
    reward: 150, icon: "👛", category: "start",
    check: ctx => ctx.walletAddress != null,
  },
  {
    id: "first_claim", title: "Первый клейм",
    description: "Забери ежедневный бонус",
    reward: 100, icon: "🎁", category: "start",
    check: ctx => ctx.lastClaimAt != null,
  },
  // ── Ежедневные ────────────────────────────────────────────────────────────
  {
    id: "claim_7", title: "Неделя клеймов",
    description: "Забери бонус 7 дней подряд",
    reward: 500, icon: "🔥", category: "daily",
    // Трекинг серии клеймов появится позже
  },
  {
    id: "claim_30", title: "Месяц клеймов",
    description: "Забери бонус 30 дней подряд",
    reward: 2000, icon: "💫", category: "daily",
  },
  {
    id: "veteran_30", title: "Ветеран 30 дней",
    description: "Проведи в игре 30 дней",
    reward: 1000, icon: "🗓️", category: "daily",
  },
  // ── Рефералы ──────────────────────────────────────────────────────────────
  {
    id: "invite_1", title: "Первый реферал",
    description: "Пригласи 1 друга по своей ссылке",
    reward: 200, icon: "👥", category: "referral",
    check: ctx => ctx.referralCount >= 1,
  },
  {
    id: "invite_5", title: "Команда 5",
    description: "Пригласи 5 друзей",
    reward: 600, icon: "🤝", category: "referral",
    check: ctx => ctx.referralCount >= 5,
  },
  {
    id: "invite_10", title: "Команда 10",
    description: "Пригласи 10 друзей",
    reward: 1500, icon: "🏆", category: "referral",
    check: ctx => ctx.referralCount >= 10,
  },
  // ── Донаты ────────────────────────────────────────────────────────────────
  {
    id: "donate_any", title: "Первая поддержка",
    description: "Сделай первый TON-донат",
    reward: 300, icon: "💎", category: "donate",
    check: ctx => ctx.totalDonatedTon > 0,
  },
  {
    id: "donate_1ton", title: "1 TON донат",
    description: "Отправь суммарно 1 TON",
    reward: 700, icon: "💎", category: "donate",
    check: ctx => ctx.totalDonatedTon >= 1,
  },
  {
    id: "donate_10ton", title: "Большой донат",
    description: "Отправь суммарно 10 TON",
    reward: 3000, icon: "💎", category: "donate",
    check: ctx => ctx.totalDonatedTon >= 10,
  },
  {
    id: "stars_buy", title: "Покупка за Stars",
    description: "Купи монеты за Telegram Stars",
    reward: 300, icon: "⭐", category: "donate",
    // Добавится после трекинга Stars-покупок
  },
  // ── Игра ──────────────────────────────────────────────────────────────────
  {
    id: "game_1", title: "Первая игра",
    description: "Сыграй первую партию",
    reward: 100, icon: "🎰", category: "game",
  },
  {
    id: "game_10", title: "10 игр",
    description: "Сыграй 10 партий",
    reward: 500, icon: "🎮", category: "game",
  },
  {
    id: "game_50", title: "Ветеран арены",
    description: "Сыграй 50 партий",
    reward: 2000, icon: "🌟", category: "game",
  },
  {
    id: "win_1", title: "Первая победа",
    description: "Выиграй первую партию",
    reward: 200, icon: "🏅", category: "game",
  },
  {
    id: "top_100", title: "В топ-100",
    description: "Войди в таблицу лидеров",
    reward: 1000, icon: "🥇", category: "game",
  },
];

export const TASK_TOTAL = TASK_DEFS.length; // 18

// ── TaskService ───────────────────────────────────────────────────────────────

export class TaskService {
  static async getTasks(userId: number): Promise<TasksInfo> {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: BigInt(userId) },
      include: {
        completedTasks: { select: { taskId: true } },
        _count:         { select: { referrals: true } },
      },
    });

    const claimedIds = new Set(user.completedTasks.map(t => t.taskId));

    const ctx: TaskContext = {
      walletAddress:   user.walletAddress,
      lastClaimAt:     user.lastClaimAt,
      totalDonatedTon: user.totalDonatedTon,
      referralCount:   user._count.referrals,
    };

    const tasks: TaskItem[] = TASK_DEFS.map(def => {
      let status: TaskStatus;
      if (claimedIds.has(def.id)) {
        status = "claimed";
      } else if (!def.check) {
        status = "locked";
      } else if (def.check(ctx)) {
        status = "claimable";
      } else {
        status = "unclaimed";
      }
      return {
        id: def.id, title: def.title, description: def.description,
        reward: def.reward, icon: def.icon, category: def.category,
        status,
      };
    });

    const completedCount = tasks.filter(t => t.status === "claimed").length;
    return { tasks, completedCount, totalCount: TASK_TOTAL };
  }

  static async claimTask(userId: number, taskId: string): Promise<TaskClaimResult> {
    const def = TASK_DEFS.find(d => d.id === taskId);
    if (!def) throw Object.assign(new Error("Task not found"), { statusCode: 404 });
    if (!def.check) throw Object.assign(new Error("Task not available yet"), { statusCode: 400 });

    const user = await prisma.user.findUniqueOrThrow({
      where: { id: BigInt(userId) },
      include: {
        completedTasks: { where: { taskId }, select: { taskId: true } },
        _count:         { select: { referrals: true } },
      },
    });

    if (user.completedTasks.length > 0) {
      throw Object.assign(new Error("Task already claimed"), { statusCode: 409 });
    }

    const ctx: TaskContext = {
      walletAddress:   user.walletAddress,
      lastClaimAt:     user.lastClaimAt,
      totalDonatedTon: user.totalDonatedTon,
      referralCount:   user._count.referrals,
    };

    if (!def.check(ctx)) {
      throw Object.assign(new Error("Task condition not met"), { statusCode: 400 });
    }

    const updated = await prisma.$transaction([
      prisma.userTask.create({ data: { userId: BigInt(userId), taskId } }),
      prisma.user.update({
        where: { id: BigInt(userId) },
        data: { coins: { increment: def.reward } },
        select: { coins: true },
      }),
    ]);

    return { coins: updated[1].coins };
  }
}
