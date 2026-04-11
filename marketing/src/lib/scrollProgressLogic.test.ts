import { describe, expect, it } from "vitest";
import { progressToStepIndex } from "./scrollProgressLogic";

describe("progressToStepIndex", () => {
  it("returns 0 for a single step", () => {
    expect(progressToStepIndex(0.5, 1)).toBe(0);
  });

  it("maps three steps across progress", () => {
    expect(progressToStepIndex(0, 3)).toBe(0);
    expect(progressToStepIndex(0.2, 3)).toBe(0);
    expect(progressToStepIndex(0.34, 3)).toBe(1);
    expect(progressToStepIndex(0.7, 3)).toBe(2);
    expect(progressToStepIndex(1, 3)).toBe(2);
  });

  it("clamps progress", () => {
    expect(progressToStepIndex(-1, 3)).toBe(0);
    expect(progressToStepIndex(2, 3)).toBe(2);
  });
});
