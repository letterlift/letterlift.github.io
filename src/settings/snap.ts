/** Snap a slider value to its step grid and clamp it, avoiding float noise like 0.30000000000000004. */
export function snapToStep(value: number, min: number, max: number, step: number): number {
  const decimals = (String(step).split('.')[1] ?? '').length
  const snapped = min + Math.round((value - min) / step) * step
  const clamped = Math.min(max, Math.max(min, snapped))
  return Number(clamped.toFixed(decimals))
}
