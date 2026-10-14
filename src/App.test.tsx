import { fireEvent, render, screen } from '@testing-library/react'
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
})
