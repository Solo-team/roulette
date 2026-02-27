import "fastify";

declare module "fastify" {
  interface FastifyContextConfig {
    rawBody?: boolean;
    rateLimit?: {
      max: number;
      timeWindow: string;
    };
  }
}
