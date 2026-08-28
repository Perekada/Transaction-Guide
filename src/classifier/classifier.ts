import { RULES } from "../rules/rules";
import { normalizeDescription } from "./normalize";
import type {
  Category,
  ClassificationResult,
  Evidence,
  Transaction,
} from "./types";

const CLASSIFICATION_THRESHOLD = 0.7;
const MIN_MARGIN = 0.1;

export function classify(transaction: Transaction): ClassificationResult {
  const description = normalizeDescription(transaction.description);

  const evidence: Evidence[] = [];

  for (const rule of RULES) {
    if (rule.pattern.test(description)) {
      evidence.push({
        ruleId: rule.id,
        category: rule.category,
        score: rule.weight,
        description: rule.description,
      });
    }
  }

  if (evidence.length === 0) {
    return fallback(0, [], "No reliable evidence found");
  }

  const scores = new Map<Category, number>();

  for (const item of evidence) {
    const current = scores.get(item.category) ?? 0;

    // Multiple independent signals increase confidence,
    // but confidence can never exceed 1.
    scores.set(item.category, Math.min(1, current + item.score));
  }

  const ranked = [...scores.entries()].sort((a, b) => b[1] - a[1]);

  const [winner, winnerScore] = ranked[0];
  const runnerUpScore = ranked[1]?.[1] ?? 0;

  const margin = winnerScore - runnerUpScore;

  if (winnerScore < CLASSIFICATION_THRESHOLD) {
    return fallback(
      winnerScore,
      evidence,
      "Evidence did not meet the classification threshold",
    );
  }

  if (ranked.length > 1 && margin < MIN_MARGIN) {
    return fallback(
      winnerScore,
      evidence,
      "Conflicting category evidence",
    );
  }

  return {
    category: winner,
    confidence: round(winnerScore),
    decision: "classified",
    evidence,
    reason: "Sufficient supporting evidence",
  };
}

function fallback(
  confidence: number,
  evidence: Evidence[],
  reason: string,
): ClassificationResult {
  return {
    category: "unknown",
    confidence: round(confidence),
    decision: "fallback",
    evidence,
    reason,
  };
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
