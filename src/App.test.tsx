import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
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

  it('opens the reader with shared text from ?text= and strips the query', () => {
    window.history.replaceState(null, '', '/?title=Hi&text=' + encodeURIComponent('Zażółć gęślą jaźń') + '&url=')
    render(<App />)
    expect(screen.getByRole('main')).toHaveTextContent(/Zażółć gęślą jaźń/)
    expect(window.location.search).toBe('')
    expect(document.title).toBe('Hi · LetterLift')
    window.history.replaceState(null, '', '/')
  })

  it('stays on home when the query has no shared text', () => {
    window.history.replaceState(null, '', '/?foo=bar')
    render(<App />)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    window.history.replaceState(null, '', '/')
  })

  it('scrolls to the top when a document is opened', () => {
    const scrollTo = vi.fn()
    vi.spyOn(window, 'scrollTo').mockImplementation(scrollTo)
    render(<App />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Hello there world' } })
    fireEvent.click(screen.getByRole('button', { name: /^(Read|Czytaj)$/ }))
    expect(scrollTo).toHaveBeenCalledWith(0, 0)
    vi.restoreAllMocks()
  })

  it('opens Privacy & terms from the footer, sets the title, and goes back', () => {
    window.history.replaceState(null, '', '/')
    render(<App />)
    fireEvent.click(within(screen.getByRole('contentinfo')).getByRole('link', { name: /Privacy & terms|Prywatność i zasady/ }))
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Privacy & terms|Prywatność i zasady/)
    expect(window.location.hash).toBe('#privacy')
    expect(document.title).toMatch(/^(Privacy & terms|Prywatność i zasady) · LetterLift$/)
    act(() => {
      window.history.back()
    })
    return waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Read the way|Czytaj tak/)
    })
  })

  it('opens Privacy & terms directly from the #privacy hash', () => {
    window.history.replaceState(null, '', '/#privacy')
    render(<App />)
    expect(screen.getByRole('heading', { level: 2, name: /Medical disclaimer|Zastrzeżenie medyczne/ })).toBeInTheDocument()
    window.history.replaceState(null, '', '/')
  })
})
