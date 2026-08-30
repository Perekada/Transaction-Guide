import type { Transaction, Category } from "../classifier/types";

export interface LLMResponse {
  category: Category;
  confidence: number; // 0..1
  explanation?: string;
}

export interface LLMProvider {
  generateSinglePrompt(tx: Transaction): Promise<LLMResponse>;
  generateWithContext(tx: Transaction, context: string): Promise<LLMResponse>;
}

function simplePromptGuess(tx: Transaction): LLMResponse {
  const t = tx.description.toLowerCase();
  if (/netflix|spotify/.test(t)) {
    return { category: "subscriptions", confidence: 0.72, explanation: "Naive prompt matched a subscription keyword" };
  }
  if (/uber|bolt|lyft/.test(t)) return { category: "transport", confidence: 0.7, explanation: "Naive prompt matched transport keyword" };
  if (/amazon|prime/.test(t)) return { category: "shopping", confidence: 0.69, explanation: "Naive prompt matched shopping keyword" };
  if (/shoprite|checkers|walmart|pick n pay/.test(t)) return { category: "groceries", confidence: 0.68, explanation: "Naive prompt matched grocery keyword" };
  return { category: "unknown", confidence: 0.2, explanation: "Naive prompt had no reliable clue" };
}

// Naive, local, deterministic LLM simulator used for reproducible tests and baseline experiments.
// It does not use the rule-engine; it relies only on a very small lexical prompt heuristic.
export class NaiveLocalLLM implements LLMProvider {
  async generateSinglePrompt(tx: Transaction) {
    return simplePromptGuess(tx);
  }

  async generateWithContext(tx: Transaction, context: string) {
    // Tool-aware agent gets rule and memory context. If the context contains a category, prefer it.
    const memMatch = /memory:\s*([\w-]+)/i.exec(context);
    if (memMatch) {
      const cat = memMatch[1] as Category;
      return { category: cat, confidence: 0.8, explanation: `Used merchant memory: ${cat}` };
    }

    const ruleMatch = /rule:\s*([\w-]+)\s+confidence=([0-9.]+)/i.exec(context);
    if (ruleMatch) {
      const cat = ruleMatch[1] as Category;
      const conf = Number(ruleMatch[2]);
      return { category: cat, confidence: Math.min(1, conf + 0.05), explanation: `Used verified rule signal: ${cat}` };
    }

    const modelMatch = /model:\s*([\w-]+)\s+confidence=([0-9.]+)/i.exec(context);
    if (modelMatch) {
      const cat = modelMatch[1] as Category;
      const conf = Number(modelMatch[2]);
      return { category: cat, confidence: Math.min(1, conf + 0.03), explanation: `Used statistical model signal: ${cat}` };
    }

    return simplePromptGuess(tx);
  }
}
