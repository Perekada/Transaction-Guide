import Fastify from "fastify";
import { classify } from "./classifier/classifier";
import { naiveLLMBaseline, toolAwareAgent } from "./agent/agent";

const fastify = Fastify({ logger: true });

fastify.post("/classify/rule", async (request, reply) => {
  const body = request.body as any;
  if (!body || typeof body.description !== "string" || typeof body.amount !== "number") {
    return reply.status(400).send({ error: "Invalid payload" });
  }
  const result = classify({ description: body.description, amount: body.amount });
  return result;
});

fastify.post("/classify/llm", async (request, reply) => {
  const body = request.body as any;
  if (!body || typeof body.description !== "string" || typeof body.amount !== "number") {
    return reply.status(400).send({ error: "Invalid payload" });
  }
  const result = await naiveLLMBaseline({ description: body.description, amount: body.amount });
  return result;
});

fastify.post("/classify/agent", async (request, reply) => {
  const body = request.body as any;
  if (!body || typeof body.description !== "string" || typeof body.amount !== "number") {
    return reply.status(400).send({ error: "Invalid payload" });
  }
  const result = await toolAwareAgent({ description: body.description, amount: body.amount });
  return result;
});

const port = process.env.PORT ? Number(process.env.PORT) : 3000;

fastify.listen({ port, host: "0.0.0.0" }).then(() => {
  fastify.log.info(`Server listening at http://0.0.0.0:${port}`);
}).catch((err) => {
  fastify.log.error(err);
  process.exit(1);
});
