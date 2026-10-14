import { describe, expect, it } from 'vitest'

const EM = '\u2014'
const EN = '\u2013'

const sources = import.meta.glob(['./i18n/*.ts', '../README.md', '../index.html'], {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

describe('no long dashes in copy', () => {
  it('finds the files it is meant to check', () => {
    expect(Object.keys(sources).length).toBeGreaterThanOrEqual(4)
  })
  for (const [file, text] of Object.entries(sources)) {
    it(`${file} has no em or en dashes`, () => {
      expect(text.includes(EM)).toBe(false)
      expect(text.includes(EN)).toBe(false)
    })
  }
})
