# Evaluation Report

## Summary

Baseline: count=6, coverage=50.0%, accuracy=66.7%
Agent: count=6, coverage=83.3%, accuracy=100.0%

## Per-sample results

- id=1 label=subscriptions baseline=subscriptions@0.72 agent=subscriptions@1
- id=2 label=transport baseline=transport@0.7 agent=transport@0.8
- id=3 label=income baseline=unknown@0.2 agent=income@0.8
- id=4 label=shopping baseline=shopping@0.69 agent=shopping@0.8
- id=5 label=utilities baseline=unknown@0.2 agent=utilities@0.95
- id=6 label=unknown baseline=unknown@0.2 agent=unknown@0.05

## Trajectory sample (last 10)

- [2026-08-29T20:14:56.967Z] phase=baseline decision=accepted tool= result={"category":"shopping","confidence":0.69,"source":"llm","explanation":"Naive prompt matched shopping keyword"}
- [2026-08-29T20:14:56.967Z] phase=tool-loop decision= tool=rule-engine result=
- [2026-08-29T20:14:56.967Z] phase=tool-loop decision= tool=merchant-memory result=
- [2026-08-29T20:14:56.968Z] phase=verification decision=accepted tool= result={"category":"shopping","confidence":0.8,"source":"tool-llm","explanation":"Used merchant memory: shopping"}
- [2026-08-29T20:14:56.968Z] phase=baseline decision=uncertain tool= result={"category":"unknown","confidence":0.2,"source":"llm","explanation":"Naive prompt had no reliable clue"}
- [2026-08-29T20:14:56.968Z] phase=tool-loop decision= tool=rule-engine result=
- [2026-08-29T20:14:56.969Z] phase=verification decision=accepted tool= result={"category":"utilities","confidence":0.95,"source":"llm","explanation":"Used verified rule signal: utilities"}
- [2026-08-29T20:14:56.969Z] phase=baseline decision=uncertain tool= result={"category":"unknown","confidence":0.2,"source":"llm","explanation":"Naive prompt had no reliable clue"}
- [2026-08-29T20:14:56.969Z] phase=tool-loop decision= tool=rule-engine result=
- [2026-08-29T20:14:56.970Z] phase=verification decision=uncertain tool= result={"category":"unknown","confidence":0.05,"source":"llm","explanation":"Used verified rule signal: unknown"}