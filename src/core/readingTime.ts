import type { Block } from '../ingest/types'

export const DEFAULT_WPM = 200

/** Estimated reading time in whole minutes (never less than 1). */
export function readingTime(blocks: Block[], wpm: number = DEFAULT_WPM): number {
  const rate = Number.isFinite(wpm) && wpm > 0 ? wpm : DEFAULT_WPM
  let words = 0
  for (const b of blocks) {
    const t = b.text.trim()
    if (t) words += t.split(/\s+/).length
  }
  return Math.max(1, Math.round(words / rate))
}
