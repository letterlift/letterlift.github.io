import { describe, expect, it } from 'vitest'
import { readingTime } from './readingTime'
import type { Block } from '../ingest/types'

const words = (n: number): Block => ({
  type: 'paragraph',
  text: Array.from({ length: n }, () => 'word').join(' '),
})

describe('readingTime', () => {
  it('returns at least 1 minute, even for empty input', () => {
    expect(readingTime([])).toBe(1)
    expect(readingTime([{ type: 'paragraph', text: '   ' }])).toBe(1)
    expect(readingTime([words(5)])).toBe(1)
  })

  it('uses 200 words per minute by default', () => {
    expect(readingTime([words(200)])).toBe(1)
    expect(readingTime([words(1000)])).toBe(5)
  })

  it('sums words across all block types', () => {
    const blocks: Block[] = [
      { type: 'heading', text: words(100).text },
      { type: 'paragraph', text: words(300).text },
      { type: 'list-item', text: words(600).text },
    ]
    expect(readingTime(blocks)).toBe(5)
  })

  it('rounds to the nearest minute', () => {
    expect(readingTime([words(299)])).toBe(1)
    expect(readingTime([words(300)])).toBe(2)
  })

  it('accepts a custom words-per-minute rate', () => {
    expect(readingTime([words(1000)], 250)).toBe(4)
  })

  it('falls back to the default rate for a non-positive wpm', () => {
    expect(readingTime([words(1000)], 0)).toBe(5)
  })
})
