import { describe, expect, it } from 'vitest'
import { ISSUES_URL, REPO_URL, voteUrl } from './links'

describe('voteUrl', () => {
  it('encodes Polish characters and spaces in title and body', () => {
    const url = voteUrl('Głos: Tekst ze zdjęcia', 'Chcę tę funkcję, bo… (opcjonalnie)')
    expect(url.startsWith(`${ISSUES_URL}?title=`)).toBe(true)
    expect(url).not.toMatch(/ /)
    expect(url).not.toMatch(/[ąćęłńóśźż…]/i)
    const u = new URL(url)
    expect(u.searchParams.get('title')).toBe('Głos: Tekst ze zdjęcia')
    expect(u.searchParams.get('body')).toBe('Chcę tę funkcję, bo… (opcjonalnie)')
  })
})

describe('repo links', () => {
  it('point to the letterlift organization repo', () => {
    expect(REPO_URL).toBe('https://github.com/letterlift/letterlift.github.io')
    expect(ISSUES_URL).toBe(`${REPO_URL}/issues/new`)
  })
})
