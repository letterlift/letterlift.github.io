import { render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { About } from './About'
import { LANG_KEY, resetLangForTests } from '../i18n'

describe('About', () => {
  beforeEach(() => {
    localStorage.clear()
    resetLangForTests()
  })
  afterEach(() => {
    localStorage.clear()
    resetLangForTests()
  })

  it('renders the technique paragraph with bolded word beginnings and a caption', () => {
    const { container } = render(<About onBack={vi.fn()} onPrivacy={vi.fn()} />)
    const section = screen.getByRole('heading', { level: 2, name: /How the technique works|Na czym polega/ }).closest('section')!
    expect(section.querySelectorAll('b').length).toBeGreaterThan(5)
    expect(within(section).getByText(/uses the technique|tą techniką/)).toBeInTheDocument()
    // the rest of About stays plain
    expect(container.querySelectorAll('b').length).toBe(section.querySelectorAll('b').length)
  })

  it('has contact links that open safely in a new tab', () => {
    render(<About onBack={vi.fn()} onPrivacy={vi.fn()} />)
    const issues = screen.getByRole('link', { name: /Report on GitHub|Zgłoś na GitHubie/ })
    const fbs = screen.getAllByRole('link', { name: /Message me on Facebook|Napisz do mnie na Facebooku/ })
    expect(fbs).toHaveLength(2)
    const fb = fbs[1]
    expect(issues).toHaveAttribute('href', 'https://github.com/drogazem-design/letterlift/issues/new')
    expect(fb).toHaveAttribute('href', 'https://www.facebook.com/profile.php?id=1200145816')
    for (const a of [issues, ...fbs]) {
      expect(a).toHaveAttribute('target', '_blank')
      expect(a).toHaveAttribute('rel', 'noopener noreferrer')
      expect(a).toHaveTextContent(/opens in a new tab|otwiera się w nowej karcie/)
    }
  })

  it('has the Polish heading in Polish', () => {
    localStorage.setItem(LANG_KEY, 'pl')
    resetLangForTests()
    render(<About onBack={vi.fn()} onPrivacy={vi.fn()} />)
    expect(screen.getByRole('heading', { name: 'O autorce i kontakt' })).toBeInTheDocument()
  })

  it('lists four plans with prefilled vote links and no claim that they exist', () => {
    localStorage.setItem(LANG_KEY, 'en')
    resetLangForTests()
    render(<About onBack={vi.fn()} onPrivacy={vi.fn()} />)
    const links = screen.getAllByRole('link', { name: /I want this!/ })
    expect(links).toHaveLength(4)
    const u = new URL(links[1].getAttribute('href')!)
    expect(u.origin + u.pathname).toBe('https://github.com/drogazem-design/letterlift/issues/new')
    expect(u.searchParams.get('title')).toBe('Vote: Text from a photo or scan')
    for (const a of links) {
      expect(a).toHaveAttribute('target', '_blank')
      expect(a).toHaveAttribute('rel', 'noopener noreferrer')
    }
    expect(screen.getByText(/None of these features exist yet/)).toBeInTheDocument()
  })
})
