import { describe, expect, it } from "vitest";
import { buildBudgetDemoSnapshot, clamp } from "./budgetDemoLogic";

describe("clamp", () => {
  it("keeps value inside bounds", () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(99, 0, 10)).toBe(10);
  });
});

describe("buildBudgetDemoSnapshot", () => {
  it("caps planned spend at income and computes unallocated", () => {
    const s = buildBudgetDemoSnapshot(80_000, 95_000);
    expect(s.income).toBe(80_000);
    expect(s.planned).toBe(80_000);
    expect(s.unallocated).toBe(0);
    expect(s.utilizationPercent).toBe(100);
  });

  it("handles zero income", () => {
    const s = buildBudgetDemoSnapshot(0, 10_000);
    expect(s.planned).toBe(0);
    expect(s.unallocated).toBe(0);
    expect(s.utilizationPercent).toBe(0);
  });

  it("rounds utilization to whole percent", () => {
    const s = buildBudgetDemoSnapshot(100_000, 33_333);
    expect(s.utilizationPercent).toBe(33);
  });
});
