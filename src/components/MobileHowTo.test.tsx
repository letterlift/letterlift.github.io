import { render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { LANG_KEY, resetLangForTests } from '../i18n'
import { pl } from '../i18n/pl'
import { MobileHowTo } from './MobileHowTo'

function setLang(lang: 'pl' | 'en') {
  localStorage.setItem(LANG_KEY, lang)
  resetLangForTests()
}

describe('MobileHowTo', () => {
  beforeEach(() => setLang('pl'))
  afterEach(() => {
    localStorage.clear()
    resetLangForTests()
  })

  it('renders the heading, both cards and 3 Android steps', () => {
    render(<MobileHowTo shortcutUrl="" />)
    expect(screen.getByRole('heading', { level: 2, name: 'Na telefonie' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Android' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'iPhone' })).toBeInTheDocument()
    expect(within(screen.getByRole('article', { name: 'Android' })).getAllByRole('listitem')).toHaveLength(3)
  })

  it('shows the fallback steps and no shortcut link when no shortcut URL is set', () => {
    render(<MobileHowTo shortcutUrl="" />)
    const items = within(screen.getByRole('article', { name: 'iPhone' })).getAllByRole('listitem')
    expect(items.map((li) => li.textContent)).toEqual(pl.mobile.ios.fallbackSteps)
    expect(screen.queryByRole('link', { name: /Dodaj skrót/ })).not.toBeInTheDocument()
    expect(screen.queryByText(pl.mobile.ios.shortcutNote)).not.toBeInTheDocument()
  })

  it('shows the shortcut button and steps when a shortcut URL is set', () => {
    render(<MobileHowTo shortcutUrl="https://www.icloud.com/shortcuts/abc" />)
    const link = screen.getByRole('link', { name: /Dodaj skrót/ })
    expect(link).toHaveAttribute('href', 'https://www.icloud.com/shortcuts/abc')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    const items = within(screen.getByRole('article', { name: 'iPhone' })).getAllByRole('listitem')
    expect(items.map((li) => li.textContent)).toEqual(pl.mobile.ios.shortcutSteps)
    expect(screen.queryByText(pl.mobile.ios.fallbackSteps[0])).not.toBeInTheDocument()
    expect(screen.getByText(pl.mobile.ios.shortcutNote)).toBeInTheDocument()
  })

  it('renders in English', () => {
    setLang('en')
    render(<MobileHowTo shortcutUrl="" />)
    expect(screen.getByRole('heading', { level: 2, name: 'On your phone' })).toBeInTheDocument()
  })
})
