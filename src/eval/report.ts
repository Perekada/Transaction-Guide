import fs from "fs";
import path from "path";
import { runEvaluation } from "./evaluate";

async function main() {
  const res = await runEvaluation();
  const reportPath = path.join(__dirname, "..", "..", "REPORT.md");

  const lines: string[] = [];
  lines.push("# Evaluation Report\n");
  lines.push("## Summary\n");
  lines.push(`Baseline: count=${res.baseline.count}, coverage=${(res.baseline.coverage*100).toFixed(1)}%, accuracy=${res.baseline.accuracy === null ? 'n/a' : (res.baseline.accuracy*100).toFixed(1)+'%'}`);
  lines.push(`Agent: count=${res.agent.count}, coverage=${(res.agent.coverage*100).toFixed(1)}%, accuracy=${res.agent.accuracy === null ? 'n/a' : (res.agent.accuracy*100).toFixed(1)+'%'}`);
  lines.push('\n## Per-sample results\n');

  for (const br of res.baselineResults) {
    lines.push(`- id=${br.id} label=${br.label} baseline=${br.result.category}@${br.result.confidence} agent=${res.agentResults.find(a=>a.id===br.id)?.result.category}@${res.agentResults.find(a=>a.id===br.id)?.result.confidence}`);
  }

  lines.push('\n## Trajectory sample (last 10)\n');
  const traj = res.trajectories.slice(-10);
  for (const t of traj) {
    lines.push(`- [${t.timestamp}] phase=${t.phase} decision=${t.decision ?? ''} tool=${t.tool ?? ''} result=${t.result ? JSON.stringify(t.result) : ''}`);
  }

  fs.writeFileSync(reportPath, lines.join('\n'), 'utf-8');
  console.log(`Wrote ${reportPath}`);
}

if (require.main === module) main().catch(e=>{ console.error(e); process.exit(1); });
