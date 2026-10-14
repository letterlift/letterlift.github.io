import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import App from './App'
import { resetLangForTests } from './i18n'

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
    resetLangForTests()
  })
  afterEach(() => {
    localStorage.clear()
    resetLangForTests()
  })

  it('shows the wordmark in the header and the headline as the page h1', () => {
    render(<App />)
    expect(screen.getByRole('link', { name: /LetterLift/ })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      /Read the way your brain likes it\.|Czytaj tak, jak lubi Twój mózg\./,
    )
  })

  it('signs the app as by Zem in the header, footer and title', () => {
    render(<App />)
    expect(screen.getByText('by Zem')).toBeInTheDocument()
    expect(screen.getByRole('contentinfo')).toHaveTextContent(/by Zem|przez Zem/)
    expect(document.title).toBe('LetterLift by Zem')
  })
})
