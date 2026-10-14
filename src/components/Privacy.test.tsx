import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Privacy } from './Privacy'
import { LANG_KEY, resetLangForTests } from '../i18n'

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
})
