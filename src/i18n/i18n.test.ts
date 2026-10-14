import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { LANG_KEY, detectLang, resetLangForTests, useI18n } from './index'
import { pl } from './pl'
import { en } from './en'

function keys(o: unknown, prefix = ''): string[] {
  if (typeof o !== 'object' || o === null || Array.isArray(o)) return [prefix]
  return Object.entries(o).flatMap(([k, v]) => keys(v, prefix ? `${prefix}.${k}` : k))
}

describe('i18n', () => {
  beforeEach(() => {
    localStorage.clear()
    resetLangForTests()
  })
  afterEach(() => {
    localStorage.clear()
    resetLangForTests()
  })

  it('detects Polish from navigator.language, English otherwise', () => {
    expect(detectLang('pl')).toBe('pl')
    expect(detectLang('pl-PL')).toBe('pl')
    expect(detectLang('en-US')).toBe('en')
    expect(detectLang('de')).toBe('en')
    expect(detectLang(undefined)).toBe('en')
  })

  it('has the same keys in both dictionaries', () => {
    expect(keys(en).sort()).toEqual(keys(pl).sort())
  })

  it('persists the chosen language and restores it', () => {
    const first = renderHook(() => useI18n())
    act(() => first.result.current.setLang('pl'))
    expect(first.result.current.lang).toBe('pl')
    expect(localStorage.getItem(LANG_KEY)).toBe('pl')
    first.unmount()

    resetLangForTests()
    const second = renderHook(() => useI18n())
    expect(second.result.current.lang).toBe('pl')
    expect(second.result.current.t.hero.headline).toBe('Czytaj tak, jak lubi Twój mózg.')
    expect(document.documentElement.lang).toBe('pl')
  })

  it('works when storage throws', () => {
    const orig = Storage.prototype.getItem
    Storage.prototype.getItem = () => {
      throw new Error('blocked')
    }
    try {
      const { result } = renderHook(() => useI18n())
      expect(['pl', 'en']).toContain(result.current.lang)
    } finally {
      Storage.prototype.getItem = orig
    }
  })
})
