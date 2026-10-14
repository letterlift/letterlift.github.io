import { describe, expect, it } from 'vitest'
import { readSharedText } from './share'

describe('readSharedText', () => {
  it('returns null when there are no params', () => {
    expect(readSharedText('')).toBeNull()
    expect(readSharedText('?')).toBeNull()
    expect(readSharedText('?foo=bar')).toBeNull()
  })

  it('returns null when all shared params are empty or whitespace', () => {
    expect(readSharedText('?title=&text=%20%20&url=')).toBeNull()
  })

  it('returns text alone', () => {
    expect(readSharedText('?text=Hello%20world')).toBe('Hello world')
  })

  it('returns title alone', () => {
    expect(readSharedText('?title=Just%20a%20title')).toBe('Just a title')
  })

  it('returns url alone', () => {
    expect(readSharedText('?url=https%3A%2F%2Fexample.com')).toBe('https://example.com')
  })

  it('joins title, text and url with blank lines in that order', () => {
    expect(readSharedText('?url=https%3A%2F%2Fa.b&text=Body&title=Head')).toBe(
      'Head\n\nBody\n\nhttps://a.b',
    )
  })

  it('skips url when it is already inside text', () => {
    const q = '?text=' + encodeURIComponent('Look https://a.b/x now') + '&url=' + encodeURIComponent('https://a.b/x')
    expect(readSharedText(q)).toBe('Look https://a.b/x now')
  })

  it('keeps url when it is not inside text', () => {
    expect(readSharedText('?text=Hi&url=https%3A%2F%2Fa.b')).toBe('Hi\n\nhttps://a.b')
  })

  it('decodes + as space and URL-encoded Polish characters', () => {
    expect(readSharedText('?text=' + encodeURIComponent('Zażółć gęślą jaźń'))).toBe('Zażółć gęślą jaźń')
    expect(readSharedText('?text=Za%C5%BC%C3%B3%C5%82%C4%87+g%C4%99%C5%9Bl%C4%85')).toBe('Zażółć gęślą')
  })

  it('preserves newlines inside text and trims the parts', () => {
    expect(readSharedText('?text=' + encodeURIComponent('  one\ntwo  '))).toBe('one\ntwo')
  })
})
