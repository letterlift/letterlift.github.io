import { describe, expect, it } from 'vitest'

const sources = import.meta.glob(['./**/*.{ts,tsx}', '!./**/*.test.{ts,tsx}'], {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

const docs = import.meta.glob(['../README.md', '../index.html'], {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

describe('licence wording', () => {
  it('has no "MIT" left in src', () => {
    expect(Object.keys(sources).length).toBeGreaterThan(10)
    expect(Object.keys(docs)).toHaveLength(2)
    const hits = Object.entries({ ...sources, ...docs })
      .filter(([, text]) => /\bMIT\b/.test(text))
      .map(([file]) => file)
    expect(hits).toEqual([])
  })
})
