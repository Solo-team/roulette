import { config } from "../config/index.js";
import { prisma } from "../lib/prisma.js";

const STARS_TO_COINS = 10; // 1 Star = 10 монет

export class PaymentService {
  /** Создаёт Stars invoice через Bot API и возвращает ссылку */
  static async createStarsInvoice(stars: number): Promise<string> {
    const res = await fetch(
      `https://api.telegram.org/bot${config.botToken}/createInvoiceLink`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Донат в рулетку",
          description: `${stars} Stars → ${stars * STARS_TO_COINS} монет`,
          payload: `stars_${stars}`,
          currency: "XTR",
          prices: [{ label: "Stars", amount: stars }],
        }),
      }
    );
    const json = (await res.json()) as { ok: boolean; result?: string };
    if (!json.ok || !json.result) throw new Error("Failed to create invoice");
    return json.result;
  }

  /** Вызывается ботом после успешной оплаты Stars */
  static async confirmStarsPayment(userId: number, payload: string): Promise<void> {
    const stars = Number(payload.replace("stars_", ""));
    await prisma.user.update({
      where: { id: BigInt(userId) },
      data: { coins: { increment: stars * STARS_TO_COINS } },
    });
  }

  /** Подтверждаем TON-донат (tx уже отправлен фронтом) */
  static async confirmTonDonate(userId: number, amountTon: number): Promise<void> {
    await prisma.user.update({
      where: { id: BigInt(userId) },
      data: { totalDonatedTon: { increment: amountTon } },
    });
  }
}
