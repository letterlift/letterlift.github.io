import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Privacy } from './Privacy'
import { LANG_KEY, resetLangForTests } from '../i18n'
import { FEEDBACK_FORM_URL, TALLY_PRIVACY_URL } from '../links'

describe('Privacy', () => {
  beforeEach(() => {
    localStorage.setItem(LANG_KEY, 'en')
    resetLangForTests()
  })
  afterEach(() => {
    localStorage.clear()
    resetLangForTests()
  })

  it('states that support is voluntary, in the owner line, privacy and terms', () => {
    render(<Privacy onBack={vi.fn()} />)
    expect(screen.getByText(/free tool you can support voluntarily/)).toBeInTheDocument()
    expect(screen.getByText(/Tipply link leads to an external service/)).toBeInTheDocument()
    expect(screen.getByText(/Financial support is entirely voluntary; using LetterLift always remains free/)).toBeInTheDocument()
  })

  it('mentions Tally, links its policy and the form, and has no social link', () => {
    const { container } = render(<Privacy onBack={vi.fn()} />)
    expect(screen.getByText(/run on Tally/)).toBeInTheDocument()
    const policy = screen.getByRole('link', { name: /Tally privacy policy/ })
    expect(policy).toHaveAttribute('href', TALLY_PRIVACY_URL)
    expect(policy).toHaveAttribute('rel', 'noopener noreferrer')
    expect(screen.getByRole('link', { name: /Write to me/ })).toHaveAttribute('href', FEEDBACK_FORM_URL)
    expect(container.textContent).not.toMatch(new RegExp('face' + 'book', 'i'))
    expect(screen.getByText('Effective from 14 October 2026')).toBeInTheDocument()
  })
})
