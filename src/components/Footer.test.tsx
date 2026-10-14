import { render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Footer } from './Footer'
import { LANG_KEY, resetLangForTests } from '../i18n'

describe('Footer', () => {
  beforeEach(() => {
    localStorage.setItem(LANG_KEY, 'en')
    resetLangForTests()
  })
  afterEach(() => {
    localStorage.clear()
    resetLangForTests()
  })

  it('has a Support link to Tipply that opens safely in a new tab', () => {
    render(<Footer onPrivacy={vi.fn()} />)
    const link = within(screen.getByRole('contentinfo')).getByRole('link', { name: /^Support/ })
    expect(link).toHaveAttribute('href', 'https://tipply.pl/@zem')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })
})
