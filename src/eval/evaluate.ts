import fs from "fs";
import path from "path";
import { naiveLLMBaseline, toolAwareAgent } from "../agent/agent";
import { readTrajectoryLog } from "../agent/trajectory";
import type { Transaction } from "../classifier/types";

const FIXTURES = path.join(__dirname, "..", "..", "data", "fixtures", "sample.json");

export async function runEvaluation() {
  const raw = fs.readFileSync(FIXTURES, "utf-8");
  const items = JSON.parse(raw) as Array<{ transaction: Transaction; label?: string; id?: string }>;

  const baselineResults = [] as any[];
  const agentResults = [] as any[];

  for (const it of items) {
    const tx = it.transaction;
    const b = await naiveLLMBaseline(tx);
    const a = await toolAwareAgent(tx);
    baselineResults.push({ id: it.id ?? null, tx, result: b, label: it.label ?? null });
    agentResults.push({ id: it.id ?? null, tx, result: a, label: it.label ?? null });
  }

  function summarize(results: any[]) {
    const coverage = results.filter((r) => r.result.category !== "unknown").length / results.length;
    const labeled = results.filter((r) => r.label != null);
    const accuracy = labeled.length === 0 ? null : labeled.filter((r) => r.result.category === r.label).length / labeled.length;
    return { count: results.length, coverage, accuracy };
  }

  const summary = {
    baseline: summarize(baselineResults),
    agent: summarize(agentResults),
    baselineResults,
    agentResults,
    trajectories: readTrajectoryLog(),
  };

  return summary;
}

if (require.main === module) {
  runEvaluation().then((r) => console.log(JSON.stringify(r, null, 2)));
}
