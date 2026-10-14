import { describe, expect, it } from 'vitest';
import { bolden, DEFAULT_STRENGTH } from './bolden';

const b = (text: string) => ({ text, bold: true });
const n = (text: string) => ({ text, bold: false });

describe('bolden', () => {
  it('exposes the default strength', () => {
    expect(DEFAULT_STRENGTH).toBe(0.45);
  });

  it('returns [] for empty input', () => {
    expect(bolden('')).toEqual([]);
  });

  it('bolds a single letter', () => {
    expect(bolden('a')).toEqual([b('a')]);
  });

  it('bolds the start of a word', () => {
    expect(bolden('people')).toEqual([b('peo'), n('ple')]);
    expect(bolden('Attention')).toEqual([b('Atte'), n('ntion')]);
  });

  it('counts code points, not UTF-16 units, for Polish letters', () => {
    expect(bolden('Zażółć')).toEqual([b('Zaż'), n('ółć')]);
  });

  it('leaves punctuation and whitespace non-bold and merges neighbours', () => {
    expect(bolden('Hello, world!')).toEqual([b('He'), n('llo, '), b('wo'), n('rld!')]);
  });

  it('does not bold pure numbers', () => {
    expect(bolden('123 go')).toEqual([n('123 '), b('g'), n('o')]);
  });

  it('clamps strength to [0.1, 0.9]', () => {
    expect(bolden('people', { strength: 5 })).toEqual([b('peopl'), n('e')]);
    expect(bolden('people', { strength: 0 })).toEqual([b('p'), n('eople')]);
  });

  it('round-trips text exactly (newlines, tabs, emoji, Polish + English)', () => {
    const input =
      'Zażółć gęślą jaźń.\tThis is a test 🙂 of the system!\n\nDrugi akapit: łódź, 42 koty & dogs 👩‍👩‍👧‍👦.\r\n  End';
    const segments = bolden(input);
    expect(segments.map((s) => s.text).join('')).toBe(input);
    for (let i = 1; i < segments.length; i++) {
      expect(segments[i].bold).not.toBe(segments[i - 1].bold);
    }
  });

  it('keeps combining marks attached to their base letter (NFD)', () => {
    const word = 'e\u0301te'; // "été" decomposed: 3 graphemes, 4 code points
    expect(bolden(word)).toEqual([b('e\u0301'), n('te')]);
    const polish = 'Zazo\u0301łc\u0301'; // decomposed ó and ć
    const segs = bolden(polish);
    expect(segs.map((x) => x.text).join('')).toBe(polish);
    expect(segs[0].bold).toBe(true);
    expect(segs[1].text.startsWith('\u0301')).toBe(false);
  });

  it('does not throw on invalid locale tags and falls back to default', () => {
    const expected = [b('peo'), n('ple')];
    expect(bolden('people', { locale: 'en_US' })).toEqual(expected);
    expect(bolden('people', { locale: '' })).toEqual(expected);
    expect(bolden('people')).toEqual(expected);
  });
});
