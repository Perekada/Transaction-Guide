import { describe, expect, it } from "vitest";
import { trainFromFixtures, loadModel, predict } from "../src/classifier/model";
import path from "path";

const FIXTURES = path.join(__dirname, "..", "data", "fixtures", "sample.json");

describe("statistical model", () => {
  it("trains from fixtures and produces a model file", () => {
    const m = trainFromFixtures(FIXTURES);
    expect(m.vocab.length).toBeGreaterThan(0);
    const loaded = loadModel();
    expect(loaded).not.toBeNull();
  });

  it("predicts categories for known merchants", () => {
    const model = loadModel();
    expect(model).not.toBeNull();
    const r = predict(model as any, { description: "NETFLIX.COM SUBSCRIPTION", amount: -12.99 });
    expect(r.category).toBeTruthy();
    expect(r.confidence).toBeGreaterThanOrEqual(0);
  });
});
