#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { classify } from "./classifier/classifier";
import { naiveLLMBaseline, toolAwareAgent } from "./agent/agent";

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error("Usage: node ./dist/cli.js <input.json>");
    process.exit(2);
  }

  const inputPath = path.resolve(args[0]);
  const raw = fs.readFileSync(inputPath, "utf-8");
  const items = JSON.parse(raw) as Array<{ id?: string; transaction: { description: string; amount: number } }>;

  const out: any[] = [];
  for (const it of items) {
    const tx = it.transaction;
    const rule = classify(tx);
    const baseline = await naiveLLMBaseline(tx);
    const agent = await toolAwareAgent(tx);
    out.push({ id: it.id ?? null, tx, rule, baseline, agent });
  }

  const outPath = path.join(path.dirname(inputPath), "classified.json");
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2), "utf-8");
  console.log(`Wrote ${outPath}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
