import type { Transaction } from "../classifier/types";
import { classify } from "../classifier/classifier";
import { loadMemory } from "./memory";

export async function ruleEngineTool(tx: Transaction) {
  // returns the classification result from the deterministic rule engine
  return classify(tx);
}

export async function merchantMemoryTool(tx: Transaction) {
  const mem = loadMemory();
  // naive merchant key: first token of normalized description
  const key = tx.description.toLowerCase().split(" ")[0];
  return mem[key] ?? null;
}
