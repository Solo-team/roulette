import type { FastifyPluginAsync } from "fastify";
import { TaskService } from "../services/TaskService.js";

const taskRoutes: FastifyPluginAsync = async (app) => {
  app.get("/tasks", async (req) => {
    return TaskService.getTasks(req.tgUser.id);
  });

  app.post<{ Params: { id: string } }>(
    "/tasks/:id/claim",
    { schema: { params: { type: "object", required: ["id"], properties: { id: { type: "string" } } } } },
    async (req, reply) => {
      try {
        return await TaskService.claimTask(req.tgUser.id, req.params.id);
      } catch (err: unknown) {
        const e = err as { statusCode?: number; message?: string };
        return reply.code(e.statusCode ?? 400).send({ error: e.message });
      }
    }
  );
};

export default taskRoutes;
