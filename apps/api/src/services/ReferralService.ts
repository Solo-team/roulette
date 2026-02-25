import { prisma } from "../lib/prisma.js";
import { config } from "../config/index.js";
import type { ReferralInfo } from "@roulette/shared";

export class ReferralService {
  static async getInfo(userId: number): Promise<ReferralInfo> {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: BigInt(userId) },
      include: { _count: { select: { referrals: true } } },
    });

    const referralLink = config.botUsername
      ? `https://t.me/${config.botUsername}?start=${userId}`
      : `https://t.me/share/url?url=${userId}`;

    return {
      referredCount: user._count.referrals,
      earnedTon: user.referralEarnings,
      referralLink,
    };
  }

  /** Привязывает реферера к новому пользователю (один раз). */
  static async applyReferral(newUserId: number, referrerId: number): Promise<void> {
    if (newUserId === referrerId) return;

    const existing = await prisma.user.findUnique({
      where: { id: BigInt(newUserId) },
      select: { referrerId: true },
    });
    // Уже есть реферер — не перезаписываем
    if (existing?.referrerId) return;

    const referrerExists = await prisma.user.findUnique({
      where: { id: BigInt(referrerId) },
      select: { id: true },
    });
    if (!referrerExists) return;

    await prisma.user.update({
      where: { id: BigInt(newUserId) },
      data: { referrerId: BigInt(referrerId) },
    });
  }

  /** Начисляет TON-вознаграждение рефереру (вызывается при поступлении комиссии). */
  static async addEarnings(referrerId: number, amountTon: number): Promise<void> {
    await prisma.user.update({
      where: { id: BigInt(referrerId) },
      data: { referralEarnings: { increment: amountTon } },
    });
  }
}
