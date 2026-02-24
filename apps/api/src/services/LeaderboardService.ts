import { prisma } from "../lib/prisma.js";
import type { LeaderboardEntry } from "@roulette/shared";

const BOARD_SIZE = 100;

export class LeaderboardService {
  static async getTop(): Promise<LeaderboardEntry[]> {
    const real = await prisma.user.findMany({
      orderBy: { coins: "desc" },
      take: BOARD_SIZE,
    });

    const entries: LeaderboardEntry[] = real.map((u) => ({
      rank: 0,
      id: u.id.toString(),
      username: u.username,
      firstName: u.firstName,
      photoUrl: u.photoUrl,
      coins: u.coins,
    }));

    // Если реальных < 100 — добираем ботами
    if (entries.length < BOARD_SIZE) {
      const bots = await prisma.botUser.findMany({
        take: BOARD_SIZE - entries.length,
        orderBy: { coins: "desc" },
      });
      for (const b of bots) {
        entries.push({
          rank: 0,
          id: `bot_${b.id}`,
          username: null,
          firstName: b.name,
          photoUrl: b.avatarUrl,
          coins: b.coins,
        });
      }
    }

    // Сортируем общий список и проставляем ранги
    entries.sort((a, b) => b.coins - a.coins);
    return entries.map((e, i) => ({ ...e, rank: i + 1 }));
  }
}
