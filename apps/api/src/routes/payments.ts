import type { FastifyPluginAsync } from "fastify";
import { PaymentService } from "../services/PaymentService.js";

const paymentsRoutes: FastifyPluginAsync = async (app) => {
  // Создать Stars invoice
  app.post<{ Body: { stars: number } }>(
    "/donate/stars",
    { schema: { body: { type: "object", required: ["stars"], properties: { stars: { type: "number", minimum: 1 } } } } },
    async (req) => {
      const invoiceUrl = await PaymentService.createStarsInvoice(req.body.stars);
      return { invoiceUrl };
    }
  );

  // Подтвердить TON-донат (фронт сообщает после tx)
  app.post<{ Body: { txHash: string; amount: string } }>(
    "/donate/ton",
    { schema: { body: { type: "object", required: ["txHash", "amount"], properties: { txHash: { type: "string" }, amount: { type: "string" } } } } },
    async (req) => {
      await PaymentService.confirmTonDonate(req.tgUser.id, parseFloat(req.body.amount));
      return { ok: true };
    }
  );
};

export default paymentsRoutes;
