import type { FastifyPluginAsync } from "fastify";
import { PaymentService } from "../services/PaymentService.js";

const paymentsRoutes: FastifyPluginAsync = async (app) => {
  // Создать Stars invoice
  app.post<{ Body: { stars: number } }>(
    "/donate/stars",
    {
      config: { rateLimit: { max: 10, timeWindow: "1 minute" } },
      schema: {
        body: {
          type: "object",
          required: ["stars"],
          properties: {
            stars: { type: "integer", minimum: 1, maximum: 2500 },
          },
        },
      },
    },
    async (req) => {
      const invoiceUrl = await PaymentService.createStarsInvoice(req.body.stars);
      return { invoiceUrl };
    }
  );

  // Подтвердить TON-донат (фронт присылает txHash из BOC + сумму)
  app.post<{ Body: { txHash: string; amount: string } }>(
    "/donate/ton",
    {
      config: { rateLimit: { max: 10, timeWindow: "1 minute" } },
      schema: {
        body: {
          type: "object",
          required: ["txHash", "amount"],
          properties: {
            txHash: {
              type: "string",
              minLength: 64,
              maxLength: 64,
              pattern: "^[a-fA-F0-9]{64}$",
            },
            amount: { type: "string", minLength: 1, maxLength: 20 },
          },
        },
      },
    },
    async (req, reply) => {
      const amount = parseFloat(req.body.amount);
      if (!Number.isFinite(amount) || amount < 0.01 || amount > 1000) {
        return reply.code(400).send({ error: "Invalid amount" });
      }

      try {
        await PaymentService.confirmTonDonate(req.tgUser.id, req.body.txHash, amount);
        return { ok: true };
      } catch (err: unknown) {
        const e = err as { statusCode?: number; message?: string };
        return reply.code(e.statusCode ?? 400).send({ error: e.message });
      }
    }
  );
};

export default paymentsRoutes;
