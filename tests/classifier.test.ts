import { describe, expect, it } from "vitest";
import { classify } from "../src/classifier/classifier";

describe("transaction classifier", () => {
  it("classifies Netflix as subscriptions", () => {
    const result = classify({
      description: "NETFLIX.COM 402-1234567",
      amount: -15.49,
    });

    expect(result.category).toBe("subscriptions");
    expect(result.decision).toBe("classified");
    expect(result.confidence).toBeGreaterThanOrEqual(0.7);
  });

  it("classifies Uber as transport", () => {
    const result = classify({
      description: "UBER TRIP",
      amount: -23.5,
    });

    expect(result.category).toBe("transport");
    expect(result.decision).toBe("classified");
  });

  it("classifies Shoprite as groceries", () => {
    const result = classify({
      description: "SHOPRITE LAGOS",
      amount: -42000,
    });

    expect(result.category).toBe("groceries");
    expect(result.decision).toBe("classified");
  });

  it("falls back for unknown transactions", () => {
    const result = classify({
      description: "POS 839271",
      amount: -42,
    });

    expect(result.category).toBe("unknown");
    expect(result.decision).toBe("fallback");
  });

  it("is case insensitive", () => {
    const a = classify({
      description: "NETFLIX",
      amount: -10,
    });

    const b = classify({
      description: "netflix",
      amount: -10,
    });

    expect(a.category).toBe(b.category);
    expect(a.confidence).toBe(b.confidence);
  });

  it("is deterministic", () => {
    const transaction = {
      description: "NETFLIX.COM",
      amount: -15,
    };

    expect(classify(transaction)).toEqual(classify(transaction));
  });

  it("normalizes excess whitespace", () => {
    const result = classify({
      description: "   NETFLIX     .COM   ",
      amount: -15,
    });

    expect(result.category).toBe("subscriptions");
  });

  it("provides evidence for its decision", () => {
    const result = classify({
      description: "NETFLIX.COM",
      amount: -15,
    });

    expect(result.evidence.length).toBeGreaterThan(0);
    expect(result.evidence[0].ruleId).toBe("merchant-netflix");
  });

  it("never produces confidence outside 0..1", () => {
    const result = classify({
      description: "NETFLIX SPOTIFY",
      amount: -20,
    });

    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
  });
});
