const BASE = (import.meta.env.VITE_API_URL ?? "") + "/api";

// ── DEV моки ─────────────────────────────────────────────────────────────────
const DEV_MOCKS: Record<string, unknown> = {
  "POST /nft/claim": () => ({
    coins: Math.floor(Math.random() * 500) + 100,
    nextClaimAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
  }),
  "GET /referrals": {
    referredCount: 0,
    earnedTon: 0,
    referralLink: "https://t.me/RollsBot?start=1",
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
