export const CATEGORIES = [
  "groceries",
  "restaurants",
  "transport",
  "utilities",
  "subscriptions",
  "entertainment",
  "shopping",
  "healthcare",
  "travel",
  "income",
  "fees",
  "transfers",
  "unknown",
] as const;

export type Category = (typeof CATEGORIES)[number];

export interface Transaction {
  description: string;
  amount: number;
  currency?: string;
}

export interface CategoryRule {
  id: string;
  category: Category;
  pattern: RegExp;
  weight: number;
  description: string;
}

export interface Evidence {
  ruleId: string;
  category: Category;
  score: number;
  description: string;
}

export interface ClassificationResult {
  category: Category;
  confidence: number;
  decision: "classified" | "fallback";
  evidence: Evidence[];
  reason: string;
}
