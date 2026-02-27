import { prisma } from "../lib/prisma.js";
import type { UserProfile } from "@roulette/shared";

export class ProfileService {
  static async getProfile(userId: number): Promise<UserProfile> {
    const [user, giftCount] = await Promise.all([
      prisma.user.findUniqueOrThrow({ where: { id: BigInt(userId) } }),
      prisma.gift.count({ where: { userId: BigInt(userId) } }),
    ]);

    return {
      id: user.id.toString(),
      username: user.username,
      firstName: user.firstName,
      photoUrl: user.photoUrl,
      coins: user.coins,
      totalDonatedTon: user.totalDonatedTon,
      walletAddress: user.walletAddress,
      lastClaimAt: user.lastClaimAt?.toISOString() ?? null,
      createdAt: user.createdAt.toISOString(),
      giftCount,
    };
  }

  static async setWallet(userId: number, address: string): Promise<void> {
    await prisma.user.update({
      where: { id: BigInt(userId) },
      data: { walletAddress: address },
    });
  }
}
