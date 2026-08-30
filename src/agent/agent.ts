import type { Transaction } from "../classifier/types";
import { NaiveLocalLLM } from "./llm";
import { ruleEngineTool, merchantMemoryTool } from "./tools";
import { AGENT_CONFIG } from "../config";
import { appendTrajectory } from "./trajectory";
import { loadModel, predict, trainFromFixtures } from "../classifier/model";
import path from "path";

export interface AgentResult {
  category: string;
  confidence: number;
  source: "rule" | "llm" | "tool-llm" | "uncertain";
  explanation?: string;
}

export async function naiveLLMBaseline(tx: Transaction) {
  const llm = new NaiveLocalLLM();
  const out = await llm.generateSinglePrompt(tx);
  const result = {
    category: out.category,
    confidence: Number(out.confidence.toFixed(2)),
    source: "llm" as const,
    explanation: out.explanation,
  } as AgentResult;

  appendTrajectory({
    timestamp: new Date().toISOString(),
    phase: "baseline",
    input: tx,
    decision: result.category === "unknown" ? "uncertain" : "accepted",
    result,
  });

  return result;
}

export async function toolAwareAgent(tx: Transaction) {
  const llm = new NaiveLocalLLM();
  const rule = await ruleEngineTool(tx);
  const memory = await merchantMemoryTool(tx);

  const fixturePath = path.join(__dirname, "..", "..", "data", "fixtures", "sample.json");
  const model = loadModel() ?? trainFromFixtures(fixturePath);
  const modelPred = predict(model, tx);

  appendTrajectory({
    timestamp: new Date().toISOString(),
    phase: "tool-loop",
    input: tx,
    tool: "rule-engine",
    toolOutput: rule,
  });

  appendTrajectory({
    timestamp: new Date().toISOString(),
    phase: "tool-loop",
    input: tx,
    tool: "model",
    toolOutput: modelPred,
  });

  if (memory) {
    appendTrajectory({
      timestamp: new Date().toISOString(),
      phase: "tool-loop",
      input: tx,
      tool: "merchant-memory",
      toolOutput: memory,
    });
  }

  // build a compact context the LLM can use
  const ctxParts: string[] = [];
  ctxParts.push(`rule: ${rule.category} confidence=${rule.confidence} reason=${rule.reason}`);
  ctxParts.push(`model: ${modelPred.category} confidence=${modelPred.confidence}`);
  if (memory) ctxParts.push(`memory: ${memory.canonicalCategory}`);
  const context = ctxParts.join("\n");

  const out = await llm.generateWithContext(tx, context);

  // Verification: if LLM/tool result disagrees with rule-engine and confidence < threshold, mark uncertain
  const threshold = AGENT_CONFIG.confidenceThreshold;
  const disagreeWithRule = out.category !== rule.category;
  const shouldFallback = disagreeWithRule && out.confidence < threshold;

  if (shouldFallback) {
    const result = {
      category: "unknown",
      confidence: Number(out.confidence.toFixed(2)),
      source: "uncertain" as const,
      explanation: `Agent and rule disagree (rule=${rule.category}), agent=${out.category}; withheld due to low confidence`,
    } as AgentResult;

    appendTrajectory({
      timestamp: new Date().toISOString(),
      phase: "verification",
      input: { tx, rule, model: modelPred, llm: out },
      decision: "uncertain",
      result,
    });

    return result;
  }

  // If model and rule agree, prefer that category; otherwise keep the visible agent answer.
  const preferredCategory = rule.category === modelPred.category ? rule.category : out.category;
  const preferredConfidence = Math.max(Number(out.confidence.toFixed(2)), Number(modelPred.confidence.toFixed(2)));

  const result = {
    category: preferredCategory,
    confidence: Number(preferredConfidence.toFixed(2)),
    source: memory ? ("tool-llm" as const) : ("llm" as const),
    explanation: out.explanation ?? `Rule/model synthesis: ${rule.category} / ${modelPred.category}`,
  } as AgentResult;

  appendTrajectory({
    timestamp: new Date().toISOString(),
    phase: "verification",
    input: { tx, rule, model: modelPred, llm: out },
    decision: result.category === "unknown" ? "uncertain" : "accepted",
    result,
  });

  return result;
}
