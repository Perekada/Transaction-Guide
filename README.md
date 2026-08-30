# Financial Transaction Categorizer (Agent + Rule Baseline)

This repository implements a deterministic rule-based baseline and an agent that combines a simulated LLM with tools (rule engine + merchant memory) and a verification step.

Goals
- Provide a simple script baseline (deterministic rules).
- Implement naive LLM baseline (single prompt, no tools).
- Implement a tool-aware agent that calls the rule-engine and merchant-memory and verifies outputs against the rule result; disagreement with low confidence produces an honest fallback.
- Produce reproducible evaluation and trajectories for judging.

Quick start (reproducible locally)

1. Install dependencies

   npm install

2. Run tests

   npm test

3. Run the evaluation (generates an interactive JSON summary)

   npx tsx src/eval/evaluate.ts

4. Generate a REPORT.md summarizing evaluation

   npx tsx src/eval/report.ts

Files of interest
- src/classifier: deterministic rule-engine and normalization
- src/agent: agent orchestrator, naive local LLM simulator, merchant memory, and trajectory logging
- src/eval: evaluation harness and report generator
- data/fixtures/sample.json: sample labeled fixture set
- data/memory.json: merchant memory used by the agent

Design decisions
- Confidence threshold defaults are defined in src/config.ts (default 0.7). This is configurable for experiments.
- The agent always verifies its LLM output against the independent rule-engine; if they disagree and the agent's confidence is below threshold it returns an explicit unknown/fallback. This prevents silent LLM hallucinations and provides a defensible fail-open policy.

Reproducing the recorded evaluation
- Run `npx tsx src/eval/evaluate.ts` to reproduce the evaluation metrics and generate a trajectory log in data/trajectories/agent.jsonl
- Run `npx tsx src/eval/report.ts` to create REPORT.md with summary metrics and a short changelog

Notes
- The LLM is simulated locally (NaiveLocalLLM) so no API key or external service is required — this keeps the benchmark deterministic and reproducible for judges.
- To use a real LLM provider replace src/agent/llm.ts with an adapter implementing the LLMProvider interface and update the agent orchestrator accordingly.
