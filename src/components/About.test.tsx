import { render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { About } from './About'
import { LANG_KEY, resetLangForTests } from '../i18n'
import { SURVEY_URL } from '../links'

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
    const surveys = screen.getAllByRole('link', { name: /Vote in the survey|Zagłosuj w ankiecie/ })
    expect(surveys).toHaveLength(1)
    expect(issues).toHaveAttribute('href', 'https://github.com/letterlift/letterlift.github.io/issues/new')
    for (const f of surveys) expect(f).toHaveAttribute('href', SURVEY_URL)
    for (const a of [issues, ...surveys]) {
      expect(a).toHaveAttribute('target', '_blank')
      expect(a).toHaveAttribute('rel', 'noopener noreferrer')
      expect(a).toHaveTextContent(/opens in a new tab|otwiera się w nowej karcie/)
    }
  })

  it('shows a single Planned pill and keeps the privacy link', () => {
    localStorage.setItem(LANG_KEY, 'en')
    resetLangForTests()
    render(<About onBack={vi.fn()} onPrivacy={vi.fn()} />)
    expect(screen.getAllByText('Planned')).toHaveLength(1)
    expect(screen.getAllByRole('link', { name: 'Privacy & terms' })).toHaveLength(2)
  })

  it('no longer has the "other things that help" tips section', () => {
    for (const lang of ['en', 'pl']) {
      localStorage.setItem(LANG_KEY, lang)
      resetLangForTests()
      const { container, unmount } = render(<About onBack={vi.fn()} onPrivacy={vi.fn()} />)
      expect(container.textContent).not.toMatch(/Other things that help|Inne rzeczy, które pomagają|Audiobooks|Audiobooki/)
      unmount()
    }
  })

  it('opens with the why paragraphs right under the h1, with no heading, lead or bold', () => {
    const cases = [
      ['en', /Ever read a whole page/, /follow the thread and read with less effort/, /How the technique works/, /free tool that bolds/],
      ['pl', /Zdarza Ci się przeczytać całą stronę/, /nie zgubić wątku i czytać z mniejszym wysiłkiem/, /Na czym polega ta technika/, /darmowe narzędzie, które pogrubia/],
    ] as const
    for (const [lang, p1, p2, firstH2, oldLead] of cases) {
      localStorage.setItem(LANG_KEY, lang)
      resetLangForTests()
      const { container, unmount } = render(<About onBack={vi.fn()} onPrivacy={vi.fn()} />)
      const h2s = screen.getAllByRole('heading', { level: 2 })
      expect(h2s[0]).toHaveTextContent(firstH2)
      const para1 = screen.getByText(p1)
      const para2 = screen.getByText(p2)
      expect(para1.parentElement).toBe(para2.parentElement)
      expect(para1.parentElement!.previousElementSibling).toBe(screen.getByRole('heading', { level: 1 }))
      expect(para1.parentElement!.querySelectorAll('b')).toHaveLength(0)
      expect(container.textContent).not.toMatch(oldLead)
      expect(screen.queryByRole('heading', { name: /Why this exists|Dlaczego to powstało/ })).toBeNull()
      unmount()
    }
  })

  it('has the Polish heading in Polish', () => {
    localStorage.setItem(LANG_KEY, 'pl')
    resetLangForTests()
    render(<About onBack={vi.fn()} onPrivacy={vi.fn()} />)
    expect(screen.getByRole('heading', { name: 'O autorce i kontakt' })).toBeInTheDocument()
  })

  it('lists four plans in a compact list with prefilled vote links and no claim that they exist', () => {
    localStorage.setItem(LANG_KEY, 'en')
    resetLangForTests()
    render(<About onBack={vi.fn()} onPrivacy={vi.fn()} />)
    const links = screen.getAllByRole('link', { name: /I want this/ })
    expect(links).toHaveLength(4)
    const list = links[0].closest('ul')!
    expect(within(list).getAllByRole('listitem')).toHaveLength(4)
    expect(links[1]).toHaveAccessibleName(/Text from a photo or scan/)
    expect(links[1]).toHaveAccessibleName(/opens in a new tab/)
    const u = new URL(links[1].getAttribute('href')!)
    expect(u.origin + u.pathname).toBe('https://github.com/letterlift/letterlift.github.io/issues/new')
    expect(u.searchParams.get('title')).toBe('Vote: Text from a photo or scan')
    for (const a of links) {
      expect(a).toHaveAttribute('target', '_blank')
      expect(a).toHaveAttribute('rel', 'noopener noreferrer')
    }
    expect(screen.getByText(/None of these exist yet/)).toBeInTheDocument()
  })

  it('offers an anonymous survey link for people without GitHub', () => {
    localStorage.setItem(LANG_KEY, 'en')
    resetLangForTests()
    render(<About onBack={vi.fn()} onPrivacy={vi.fn()} />)
    const section = screen.getByRole('heading', { level: 2, name: /What's next?/ }).closest('section')!
    const link = within(section).getByRole('link', { name: /Vote in a short, anonymous survey/ })
    expect(link).toHaveAttribute('href', SURVEY_URL)
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    expect(section.textContent).not.toMatch(/track/i)
  })

  it('says the survey is anonymous and never names the old social channel, in both languages', () => {
    for (const lang of ['en', 'pl']) {
      localStorage.setItem(LANG_KEY, lang)
      resetLangForTests()
      const { container, unmount } = render(<About onBack={vi.fn()} onPrivacy={vi.fn()} />)
      expect(container.textContent).toMatch(/survey is anonymous|Ankieta jest anonimowa/)
      expect(container.textContent).not.toMatch(new RegExp('face' + 'book', 'i'))
      unmount()
    }
  })

  it('shows a voluntary support block between the plans and the author section', () => {
    localStorage.setItem(LANG_KEY, 'en')
    resetLangForTests()
    render(<About onBack={vi.fn()} onPrivacy={vi.fn()} />)
    const h = screen.getByRole('heading', { level: 2, name: 'Support development' })
    const section = h.closest('section')!
    expect(within(section).getByText(/will stay free/)).toBeInTheDocument()
    const link = within(section).getByRole('link', { name: /Support on Tipply/ })
    expect(link).toHaveAttribute('href', 'https://tipply.pl/@zem')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    const order = screen.getAllByRole('heading', { level: 2 }).map((x) => x.textContent)
    expect(order.indexOf('Support development')).toBe(order.indexOf("What's next? Planned") + 1)
    expect(order.indexOf('About the author & contact')).toBe(order.indexOf('Support development') + 1)
  })
})
