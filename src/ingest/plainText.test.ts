import { describe, expect, it } from 'vitest';
import { parsePlainText } from './plainText';

describe('parsePlainText', () => {
  it('returns [] for empty / whitespace input', () => {
    expect(parsePlainText('')).toEqual([]);
    expect(parsePlainText('  \n \t\n\n  ')).toEqual([]);
  });

  it('splits paragraphs on blank lines and normalizes CRLF', () => {
    expect(parsePlainText('One\r\n\r\nTwo\r\n \r\nThree')).toEqual([
      { type: 'paragraph', text: 'One' },
      { type: 'paragraph', text: 'Two' },
      { type: 'paragraph', text: 'Three' },
    ]);
  });

  it('joins consecutive lines with a single space', () => {
    expect(parsePlainText('Hello\nworld\nagain')).toEqual([
      { type: 'paragraph', text: 'Hello world again' },
    ]);
  });

  it('parses headings of levels 1-6 and strips the marker', () => {
    expect(parsePlainText('# A\n\n### B\n\n###### C')).toEqual([
      { type: 'heading', text: 'A' },
      { type: 'heading', text: 'B' },
      { type: 'heading', text: 'C' },
    ]);
  });

  it('does not treat 7 hashes or "#tag" as heading', () => {
    expect(parsePlainText('####### x')).toEqual([{ type: 'paragraph', text: '####### x' }]);
    expect(parsePlainText('#tag')).toEqual([{ type: 'paragraph', text: '#tag' }]);
  });

  it('parses list items with various markers, each its own block', () => {
    expect(parsePlainText('- a\n* b\n• c\n1. d\n2) e')).toEqual([
      { type: 'list-item', text: 'a' },
      { type: 'list-item', text: 'b' },
      { type: 'list-item', text: 'c' },
      { type: 'list-item', text: 'd' },
      { type: 'list-item', text: 'e' },
    ]);
  });

  it('handles mixed blocks within one chunk', () => {
    expect(parsePlainText('# Title\nIntro line\nmore intro\n- item\nTail')).toEqual([
      { type: 'heading', text: 'Title' },
      { type: 'paragraph', text: 'Intro line more intro' },
      { type: 'list-item', text: 'item' },
      { type: 'paragraph', text: 'Tail' },
    ]);
  });

  it('de-hyphenates a word broken across lines (lowercase continuation)', () => {
    expect(parsePlainText('To jest przy-\nkład tekstu')).toEqual([
      { type: 'paragraph', text: 'To jest przykład tekstu' },
    ]);
  });

  it('keeps the hyphen when next line starts uppercase or no letter precedes', () => {
    expect(parsePlainText('Anglo-\nSaxon')).toEqual([{ type: 'paragraph', text: 'Anglo- Saxon' }]);
    expect(parsePlainText('a -\nb')).toEqual([{ type: 'paragraph', text: 'a - b' }]);
  });

  it('collapses runs of spaces and tabs and trims', () => {
    expect(parsePlainText('  a \t  b   \n\n\t- x   y ')).toEqual([
      { type: 'paragraph', text: 'a b' },
      { type: 'list-item', text: 'x y' },
    ]);
  });

  it('drops empty blocks (bare markers)', () => {
    expect(parsePlainText('# \n\n- \n\nok')).toEqual([{ type: 'paragraph', text: 'ok' }]);
  });

  it('treats NBSP like a space', () => {
    expect(parsePlainText('a\u00a0\u00a0b\n\n-\u00a0x\u00a0 y')).toEqual([
      { type: 'paragraph', text: 'a b' },
      { type: 'list-item', text: 'x y' },
    ]);
  });
});
