/** Maps normalized scroll progress [0,1] to a step index for scrollytelling sections. */

export function progressToStepIndex(progress: number, stepCount: number): number {
  if (stepCount <= 1) return 0;
  const p = Math.max(0, Math.min(1, progress));
  return Math.min(stepCount - 1, Math.floor(p * stepCount));
}
