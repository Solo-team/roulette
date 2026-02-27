const BASE = (import.meta.env.VITE_API_URL ?? "") + "/api";

// ── DEV моки ─────────────────────────────────────────────────────────────────
const DEV_MOCKS: Record<string, unknown> = {
  "POST /nft/claim": () => ({
    coins: Math.floor(Math.random() * 500) + 100,
    nextClaimAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
  }),
  "GET /inventory": [],
  "GET /shop/gifts": [
    { id: "1", name: "Lunar Snake",  emoji: "🐍", thumbnailUrl: null, starCount: 50,  isLimited: false },
    { id: "2", name: "Ice Cream",    emoji: "🍦", thumbnailUrl: null, starCount: 50,  isLimited: false },
    { id: "3", name: "Jelly Bunny",  emoji: "🐇", thumbnailUrl: null, starCount: 25,  isLimited: false },
    { id: "4", name: "Star Spinner", emoji: "⭐", thumbnailUrl: null, starCount: 150, isLimited: true, totalCount: 1000, remainingCount: 312 },
    { id: "5", name: "Diamond Ring", emoji: "💍", thumbnailUrl: null, starCount: 250, isLimited: true, totalCount: 500,  remainingCount: 77  },
    { id: "6", name: "Cozy Candle",  emoji: "🕯️", thumbnailUrl: null, starCount: 25,  isLimited: false },
    { id: "7", name: "Golden Star",  emoji: "🌟", thumbnailUrl: null, starCount: 200, isLimited: true, totalCount: 2500, remainingCount: 841 },
  ],
  "GET /referrals": {
    referredCount: 0,
    earnedTon: 0,
    referralLink: "https://t.me/RollsBot?start=1",
  },
  "GET /tasks": {
    completedCount: 1,
    totalCount: 18,
    tasks: [
      { id: "join",       title: "Добро пожаловать",   description: "Открой приложение первый раз",         reward: 50,   icon: "👋", category: "start",    status: "claimed"   },
      { id: "wallet",     title: "Привяжи кошелёк",    description: "Подключи TON-кошелёк к профилю",       reward: 150,  icon: "👛", category: "start",    status: "claimable" },
      { id: "first_claim",title: "Первый клейм",       description: "Забери ежедневный бонус",              reward: 100,  icon: "🎁", category: "start",    status: "unclaimed" },
      { id: "claim_7",    title: "Неделя клеймов",     description: "Забери бонус 7 дней подряд",           reward: 500,  icon: "🔥", category: "daily",    status: "locked"    },
      { id: "claim_30",   title: "Месяц клеймов",      description: "Забери бонус 30 дней подряд",          reward: 2000, icon: "💫", category: "daily",    status: "locked"    },
      { id: "veteran_30", title: "Ветеран 30 дней",    description: "Проведи в игре 30 дней",               reward: 1000, icon: "🗓️", category: "daily",    status: "locked"    },
      { id: "invite_1",   title: "Первый реферал",     description: "Пригласи 1 друга по своей ссылке",     reward: 200,  icon: "👥", category: "referral", status: "unclaimed" },
      { id: "invite_5",   title: "Команда 5",          description: "Пригласи 5 друзей",                    reward: 600,  icon: "🤝", category: "referral", status: "locked"    },
      { id: "invite_10",  title: "Команда 10",         description: "Пригласи 10 друзей",                   reward: 1500, icon: "🏆", category: "referral", status: "locked"    },
      { id: "donate_any", title: "Первая поддержка",   description: "Сделай первый TON-донат",              reward: 300,  icon: "💎", category: "donate",   status: "unclaimed" },
      { id: "donate_1ton",title: "1 TON донат",        description: "Отправь суммарно 1 TON",               reward: 700,  icon: "💎", category: "donate",   status: "locked"    },
      { id: "donate_10ton",title: "Большой донат",     description: "Отправь суммарно 10 TON",              reward: 3000, icon: "💎", category: "donate",   status: "locked"    },
      { id: "stars_buy",  title: "Покупка за Stars",   description: "Купи монеты за Telegram Stars",        reward: 300,  icon: "⭐", category: "donate",   status: "locked"    },
      { id: "game_1",     title: "Первая игра",        description: "Сыграй первую партию",                 reward: 100,  icon: "🎰", category: "game",     status: "locked"    },
      { id: "game_10",    title: "10 игр",             description: "Сыграй 10 партий",                     reward: 500,  icon: "🎮", category: "game",     status: "locked"    },
      { id: "game_50",    title: "Ветеран арены",      description: "Сыграй 50 партий",                     reward: 2000, icon: "🌟", category: "game",     status: "locked"    },
      { id: "win_1",      title: "Первая победа",      description: "Выиграй первую партию",                reward: 200,  icon: "🏅", category: "game",     status: "locked"    },
      { id: "top_100",    title: "В топ-100",          description: "Войди в таблицу лидеров",              reward: 1000, icon: "🥇", category: "game",     status: "locked"    },
    ],
  },
};

function getInitData(): string {
  return window.Telegram?.WebApp?.initData ?? "";
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (import.meta.env.DEV) {
    const method = (init?.method ?? "GET").toUpperCase();
    const mockKey = `${method} ${path}`;
    const mock = DEV_MOCKS[mockKey];
    if (mock) return (typeof mock === "function" ? mock() : mock) as T;
  }

  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "x-init-data": getInitData(),
      "ngrok-skip-browser-warning": "true",
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw Object.assign(new Error((err as { message?: string }).message ?? "API error"), { status: res.status, data: err });
  }
  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
};
