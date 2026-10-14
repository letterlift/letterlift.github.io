import { describe, expect, it } from 'vitest';
import { htmlToBlocks } from './html';

describe('htmlToBlocks', () => {
  it('maps h1-h6 to headings', () => {
    expect(htmlToBlocks('<h1>A</h1><h3>B</h3><h6>C</h6>')).toEqual([
      { type: 'heading', text: 'A' },
      { type: 'heading', text: 'B' },
      { type: 'heading', text: 'C' },
    ]);
  });

  it('maps p and blockquote to paragraphs', () => {
    expect(htmlToBlocks('<p>One</p><blockquote>Quote</blockquote>')).toEqual([
      { type: 'paragraph', text: 'One' },
      { type: 'paragraph', text: 'Quote' },
    ]);
  });

  it('maps li to list-item (ordered and unordered)', () => {
    expect(htmlToBlocks('<ul><li>a</li><li>b</li></ul><ol><li>c</li></ol>')).toEqual([
      { type: 'list-item', text: 'a' },
      { type: 'list-item', text: 'b' },
      { type: 'list-item', text: 'c' },
    ]);
  });

  it('uses textContent of inline markup and collapses whitespace', () => {
    expect(htmlToBlocks('<p>Hello   <strong>big</strong>\n  <em>world</em></p>')).toEqual([
      { type: 'paragraph', text: 'Hello big world' },
    ]);
  });

  it('skips empty elements', () => {
    expect(htmlToBlocks('<p>  </p><h2></h2><ul><li>&nbsp;</li></ul><p>x</p>')).toEqual([
      { type: 'paragraph', text: 'x' },
    ]);
  });

  it('ignores script and style', () => {
    expect(
      htmlToBlocks('<style>p{}</style><script>alert(1)</script><p>ok<script>bad()</script></p>'),
    ).toEqual([{ type: 'paragraph', text: 'ok' }]);
  });

  it('turns loose text nodes directly in body into paragraphs', () => {
    expect(htmlToBlocks('loose text<p>para</p>tail')).toEqual([
      { type: 'paragraph', text: 'loose text' },
      { type: 'paragraph', text: 'para' },
      { type: 'paragraph', text: 'tail' },
    ]);
  });

  it('keeps document order across mixed content', () => {
    expect(htmlToBlocks('<h1>T</h1><p>a</p><ul><li>b</li></ul><p>c</p>')).toEqual([
      { type: 'heading', text: 'T' },
      { type: 'paragraph', text: 'a' },
      { type: 'list-item', text: 'b' },
      { type: 'paragraph', text: 'c' },
    ]);
  });

  it('returns [] for empty input', () => {
    expect(htmlToBlocks('')).toEqual([]);
  });

  it('keeps nested list items separate from the parent', () => {
    expect(htmlToBlocks('<ul><li>Parent<ul><li>Child</li></ul></li></ul>')).toEqual([
      { type: 'list-item', text: 'Parent' },
      { type: 'list-item', text: 'Child' },
    ]);
  });

  it('treats <br> as a space', () => {
    expect(htmlToBlocks('<p>line one<br />line two</p>')).toEqual([
      { type: 'paragraph', text: 'line one line two' },
    ]);
  });

  it('splits paragraphs nested in a blockquote', () => {
    expect(htmlToBlocks('<blockquote><p>one</p><p>two</p></blockquote>')).toEqual([
      { type: 'paragraph', text: 'one' },
      { type: 'paragraph', text: 'two' },
    ]);
  });

  it('does not fuse paragraphs nested in a list item', () => {
    const texts = htmlToBlocks('<ul><li><p>a</p><p>b</p></li></ul>').map((b) => b.text);
    expect(texts).toEqual(['a', 'b']);
  });
});
