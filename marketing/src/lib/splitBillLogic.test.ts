import { describe, expect, it } from "vitest";
import { buildSplitBillSnapshot, clampNonNegative, sumSplitValues } from "./splitBillLogic";

describe("clampNonNegative", () => {
  it("floors negative values to zero", () => {
    expect(clampNonNegative(-3)).toBe(0);
    expect(clampNonNegative(12)).toBe(12);
  });
});

describe("sumSplitValues", () => {
  it("sums categories and ignores negative parts as zero", () => {
    expect(sumSplitValues({ a: 150, b: 400, c: -10 })).toBe(550);
  });
});

describe("buildSplitBillSnapshot", () => {
  it("computes remaining to default bucket when splits are below total", () => {
    const s = buildSplitBillSnapshot(3000, { milk: 150, fruits: 400, veg: 300, laundry: 300 });
    expect(s.total).toBe(3000);
    expect(s.assigned).toBe(1150);
    expect(s.remainingToDefault).toBe(1850);
  });

  it("caps assigned sum at total", () => {
    const s = buildSplitBillSnapshot(100, { a: 200, b: 200 });
    expect(s.assigned).toBe(100);
    expect(s.remainingToDefault).toBe(0);
  });
});
