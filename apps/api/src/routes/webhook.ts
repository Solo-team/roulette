/**
 * Telegram Bot webhook handler.
 *
 * Handles:
 *  - /start               → кнопка "Открыть рулетку" (WebApp)
 *  - pre_checkout_query   → мгновенное подтверждение (обязательно)
 *  - successful_payment   → начисляем монеты за Stars
 */

import type { FastifyPluginAsync } from "fastify";
import { config } from "../config/index.js";
import { PaymentService } from "../services/PaymentService.js";
import { ReferralService } from "../services/ReferralService.js";
import { prisma } from "../lib/prisma.js";

// ── Telegram API helpers ──────────────────────────────────────────────────────

async function tgCall(method: string, body: unknown): Promise<void> {
  await fetch(`https://api.telegram.org/bot${config.botToken}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ── Types (минимальный subset Telegram Update) ────────────────────────────────

interface TgFrom {
  id: number;
  first_name: string;
  username?: string;
}
interface TgMessage {
  message_id: number;
  chat: { id: number };
  from?: TgFrom;
  text?: string;
  successful_payment?: {
    invoice_payload: string;
    currency: string;
    total_amount: number;
  };
}
interface TgPreCheckoutQuery {
  id: string;
  from: TgFrom;
  invoice_payload: string;
  currency: string;
  total_amount: number;
}
interface TgUpdate {
  update_id: number;
  message?: TgMessage;
  pre_checkout_query?: TgPreCheckoutQuery;
}

// ── Route ─────────────────────────────────────────────────────────────────────

const webhookRoutes: FastifyPluginAsync = async (app) => {
  app.post<{ Body: TgUpdate }>(
    "/bot/webhook",
    {
      config: { rawBody: true },
      schema: { body: { type: "object" } },
    },
    async (req, reply) => {
      // Проверяем секретный токен (если задан)
      if (config.webhookSecret) {
        const secret = req.headers["x-telegram-bot-api-secret-token"];
        if (secret !== config.webhookSecret) {
          return reply.code(403).send({ error: "Forbidden" });
        }
      }

      const update = req.body;

      // ── /start ──────────────────────────────────────────────────────────────
      if (update.message?.text?.startsWith("/start") && update.message.from) {
        const chatId = update.message.chat.id;
        const from = update.message.from;

        // Upsert пользователя при /start
        await prisma.user.upsert({
          where: { id: BigInt(from.id) },
          create: { id: BigInt(from.id), firstName: from.first_name, username: from.username ?? null },
          update: { firstName: from.first_name, username: from.username ?? null },
        });

        // Реферальный параметр: /start 123456789
        const startParam = update.message.text.split(" ")[1];
        if (startParam && /^\d+$/.test(startParam)) {
          await ReferralService.applyReferral(from.id, Number(startParam));
        }

        await tgCall("sendMessage", {
          chat_id: chatId,
          text: "🎰 *Добро пожаловать в Рулетку!*\n\nОткрой профиль, посмотри свой баланс и попади в топ-100 лучших игроков.",
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [[
              {
                text: "🎰 Открыть рулетку",
                web_app: { url: config.webAppUrl },
              },
            ]],
          },
        });

        return reply.send({ ok: true });
      }

      // ── pre_checkout_query ──────────────────────────────────────────────────
      // Telegram требует ответить в течение 10 секунд
      if (update.pre_checkout_query) {
        await tgCall("answerPreCheckoutQuery", {
          pre_checkout_query_id: update.pre_checkout_query.id,
          ok: true,
        });

        return reply.send({ ok: true });
      }

      // ── successful_payment ──────────────────────────────────────────────────
      if (update.message?.successful_payment && update.message.from) {
        const { invoice_payload } = update.message.successful_payment;
        const userId = update.message.from.id;

        try {
          await PaymentService.confirmStarsPayment(userId, invoice_payload);

          // Уведомляем пользователя
          const stars = Number(invoice_payload.replace("stars_", ""));
          await tgCall("sendMessage", {
            chat_id: update.message.chat.id,
            text: `✨ Спасибо за донат! Зачислено ${stars * 10} монет на твой счёт.`,
          });
        } catch (err) {
          app.log.error({ err }, "Failed to confirm Stars payment");
        }

        return reply.send({ ok: true });
      }

      return reply.send({ ok: true });
    }
  );
};

export default webhookRoutes;
