# 5-minute Video Script — Financial Transaction Categorizer

0:00 — 0:20 Intro: problem statement
- With bank statements, categories matter for budgeting and analytics. LLMs can help but may hallucinate.

0:20 — 1:10 Baseline
- Show the deterministic rule-based baseline: merchant keyword rules, regexes, and scoring. Explain fallback policy.
- Show a quick run of classify on sample transactions.

1:10 — 2:10 Naive LLM baseline
- Explain single-prompt LLM baseline (no tools). Run on same fixture set and show metrics.

2:10 — 3:30 Tool-aware agent
- Show the agent architecture: tools (rule-engine, merchant-memory), LLM, verification step.
- Demonstrate an example where the agent uses memory to improve coverage and why verification prevents hallucination.

3:30 — 4:30 Evaluation and trajectories
- Show evaluation script, metrics (coverage, accuracy), and examine an agent trajectory log entry to show the exact tool calls and decision path.

4:30 — 5:00 Closing and reproduction
- Show how to reproduce locally (npm install, npx tsx src/eval/evaluate.ts, npx tsx src/eval/report.ts)
- Mention where to add categories/memory
