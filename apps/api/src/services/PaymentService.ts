import { config } from "../config/index.js";
import { prisma } from "../lib/prisma.js";

const STARS_TO_COINS = 10; // 1 Star = 10 монет
const NANO_TON = 1_000_000_000n;

// ── TON address normalisation ─────────────────────────────────────────────────
// tonapi.io returns addresses in raw form: "0:<hex>" or user-friendly form.
// We normalise both sides to lowercase hex for comparison.
function normaliseTonAddress(addr: string): string {
  return addr.toLowerCase().replace(/^0:/, "");
}

// ── tonapi.io response types ──────────────────────────────────────────────────
interface TonApiTransaction {
  in_msg?: {
    destination?: { address?: string };
    value?: string; // nanotons as string
  };
}

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
    if (!Number.isFinite(stars) || stars <= 0) {
      throw Object.assign(new Error("Invalid stars payload"), { statusCode: 400 });
    }
    await prisma.user.update({
      where: { id: BigInt(userId) },
      data: { coins: { increment: stars * STARS_TO_COINS } },
    });
  }

  /**
   * Подтверждаем TON-донат с верификацией транзакции через tonapi.io.
   *
   * Алгоритм:
   * 1. Проверяем, не обработан ли txHash ранее (идемпотентность).
   * 2. Запрашиваем транзакцию у tonapi.io.
   * 3. Проверяем: получатель == наш кошелёк, сумма >= заявленной (допуск 1%).
   * 4. В одной транзакции БД: сохраняем ProcessedTx + начисляем totalDonatedTon.
   */
  static async confirmTonDonate(
    userId: number,
    txHash: string,
    amountTon: number
  ): Promise<void> {
    if (!config.donationWallet) {
      throw Object.assign(new Error("TON donations not configured"), { statusCode: 503 });
    }

    // 1. Идемпотентность
    const already = await prisma.processedTx.findUnique({ where: { txHash } });
    if (already) {
      throw Object.assign(new Error("Transaction already processed"), { statusCode: 409 });
    }

    // 2. Получаем данные транзакции
    const headers: Record<string, string> = { Accept: "application/json" };
    if (config.tonApiKey) headers["Authorization"] = `Bearer ${config.tonApiKey}`;

    const res = await fetch(
      `https://tonapi.io/v2/blockchain/transactions/${encodeURIComponent(txHash)}`,
      { headers }
    );

    if (!res.ok) {
      throw Object.assign(
        new Error(`tonapi.io returned ${res.status} for tx ${txHash}`),
        { statusCode: 400 }
      );
    }

    const tx = (await res.json()) as TonApiTransaction;

    // 3. Проверяем получателя
    const destRaw = tx.in_msg?.destination?.address ?? "";
    const dest = normaliseTonAddress(destRaw);
    const wallet = normaliseTonAddress(config.donationWallet);
    if (!dest || dest !== wallet) {
      throw Object.assign(
        new Error(`Transaction destination mismatch: expected ${wallet}, got ${dest}`),
        { statusCode: 400 }
      );
    }

    // 4. Проверяем сумму в nanotons (допуск 1% на газ)
    const valueNano = BigInt(tx.in_msg?.value ?? "0");
    const claimedNano = BigInt(Math.floor(amountTon * 1e9));
    const tolerance = claimedNano / 100n;
    if (valueNano < claimedNano - tolerance) {
      throw Object.assign(
        new Error(
          `Insufficient tx value: got ${valueNano} nanoTON, expected >= ${claimedNano - tolerance}`
        ),
        { statusCode: 400 }
      );
    }

    // Используем реальную сумму из блокчейна, не из запроса пользователя
    const actualTon = Number(valueNano) / Number(NANO_TON);

    // 5. Сохраняем + начисляем атомарно
    await prisma.$transaction([
      prisma.processedTx.create({
        data: { txHash, userId: BigInt(userId), amountTon: actualTon },
      }),
      prisma.user.update({
        where: { id: BigInt(userId) },
        data: { totalDonatedTon: { increment: actualTon } },
      }),
    ]);
  }
}
