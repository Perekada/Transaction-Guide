import { describe, expect, it } from "vitest";
import { naiveLLMBaseline, toolAwareAgent } from "../src/agent/agent";
import { readTrajectoryLog } from "../src/agent/trajectory";

describe("agent trajectory logging", () => {
  it("naive baseline writes a trajectory entry", async () => {
    const before = readTrajectoryLog().length;
    await naiveLLMBaseline({ description: "NETFLIX.COM SUBSCRIPTION", amount: -12.99 });
    const after = readTrajectoryLog().length;
    expect(after).toBeGreaterThan(before);
  });

  it("tool-aware agent writes a rule and verification trace", async () => {
    const before = readTrajectoryLog().length;
    await toolAwareAgent({ description: "ELECTRICITY BILL EKEDC", amount: -60.0 });
    const after = readTrajectoryLog().length;
    expect(after).toBeGreaterThan(before);
    const last = readTrajectoryLog().at(-1);
    expect(last?.phase).toBe("verification");
  });
});
