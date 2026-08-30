import fs from "fs";
import path from "path";
import type { Transaction, Category } from "./types";

export interface TrainedModel {
  vocab: string[];
  idf: Record<string, number>;
  classLogPrior: Record<Category, number>;
  classTokenCounts: Record<Category, Record<string, number>>;
  classTokenTotals: Record<Category, number>;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

const MODEL_PATH = path.join(__dirname, "..", "..", "data", "model.json");

export function saveModel(m: TrainedModel) {
  const dir = path.dirname(MODEL_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(MODEL_PATH, JSON.stringify(m, null, 2), "utf-8");
}

export function loadModel(): TrainedModel | null {
  try {
    const raw = fs.readFileSync(MODEL_PATH, "utf-8");
    return JSON.parse(raw) as TrainedModel;
  } catch (e) {
    return null;
  }
}

export function trainFromFixtures(fixturesPath: string): TrainedModel {
  const raw = fs.readFileSync(fixturesPath, "utf-8");
  const items: Array<{ transaction: Transaction; label?: Category }> = JSON.parse(raw);

  // build vocab and per-class token counts
  const classDocs: Record<string, string[]> = {};
  const classes = new Set<string>();
  for (const it of items) {
    const label = it.label ?? "unknown";
    classes.add(label);
    const toks = tokenize(it.transaction.description);
    if (!classDocs[label]) classDocs[label] = [];
    classDocs[label].push(...toks);
  }

  const vocabSet = new Set<string>();
  for (const toks of Object.values(classDocs)) for (const t of toks) vocabSet.add(t);
  const vocab = Array.from(vocabSet).sort();

  // compute idf
  const docCount = items.length;
  const df: Record<string, number> = {};
  for (const term of vocab) {
    let count = 0;
    for (const it of items) {
      const toks = new Set(tokenize(it.transaction.description));
      if (toks.has(term)) count++;
    }
    df[term] = count;
  }

  const idf: Record<string, number> = {};
  for (const term of vocab) {
    idf[term] = Math.log((1 + docCount) / (1 + df[term])) + 1; // smoothed idf
  }

  const classTokenCounts: Record<string, Record<string, number>> = {};
  const classTokenTotals: Record<string, number> = {};
  const classDocCounts: Record<string, number> = {};
  for (const cls of classes) {
    const toks = classDocs[cls] ?? [];
    const counts: Record<string, number> = {};
    for (const t of toks) counts[t] = (counts[t] ?? 0) + 1;
    classTokenCounts[cls] = counts;
    classTokenTotals[cls] = toks.length;
    classDocCounts[cls] = (items.filter((it) => (it.label ?? "unknown") === cls).length);
  }

  // class priors
  const classLogPrior: Record<string, number> = {} as any;
  for (const cls of classes) {
    classLogPrior[cls as Category] = Math.log((classDocCounts[cls] + 1) / (docCount + classes.size));
  }

  const model: TrainedModel = {
    vocab,
    idf,
    classLogPrior: classLogPrior as Record<Category, number>,
    classTokenCounts: classTokenCounts as Record<Category, Record<string, number>>,
    classTokenTotals: classTokenTotals as Record<Category, number>,
  };

  saveModel(model);
  return model;
}

export function predict(model: TrainedModel, tx: Transaction): { category: Category; probs: Record<string, number>; confidence: number } {
  const toks = tokenize(tx.description);
  const tf: Record<string, number> = {};
  for (const t of toks) tf[t] = (tf[t] ?? 0) + 1;

  const scores: Record<string, number> = {};
  for (const cls of Object.keys(model.classLogPrior)) {
    // start with prior
    let score = model.classLogPrior[cls as Category];
    // Multinomial NB with TF-IDF weighting
    for (const term of Object.keys(tf)) {
      const termCountInClass = model.classTokenCounts[cls as Category]?.[term] ?? 0;
      const termTotal = model.classTokenTotals[cls as Category] ?? 0;
      const tfidf = (tf[term] * (model.idf[term] ?? 0));
      // approximate likelihood: log((count + 1) / (total + V)) multiplied by tfidf
      const tokenProb = Math.log((termCountInClass + 1) / (termTotal + model.vocab.length));
      score += tokenProb * tfidf;
    }
    scores[cls] = score;
  }

  // convert log-scores to probabilities using softmax
  const max = Math.max(...Object.values(scores));
  const exps: Record<string, number> = {};
  let sum = 0;
  for (const k of Object.keys(scores)) {
    const v = Math.exp(scores[k] - max);
    exps[k] = v;
    sum += v;
  }
  const probs: Record<string, number> = {};
  for (const k of Object.keys(exps)) probs[k] = exps[k] / sum;

  // pick top
  const sorted = Object.entries(probs).sort((a, b) => b[1] - a[1]);
  const category = (sorted[0]?.[0] ?? "unknown") as Category;
  const confidence = Number((sorted[0]?.[1] ?? 0).toFixed(2));
  return { category, probs, confidence };
}
