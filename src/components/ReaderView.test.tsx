import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReaderView } from './ReaderView';
import { BoldText } from './BoldText';
import { DEFAULT_SETTINGS } from '../settings/settings';

const blocks = [
  { type: 'heading' as const, text: 'Title here' },
  { type: 'paragraph' as const, text: 'Reading is wonderful today' },
  { type: 'list-item' as const, text: 'first item' },
  { type: 'list-item' as const, text: 'second item' },
  { type: 'paragraph' as const, text: 'After list' },
  { type: 'list-item' as const, text: 'lonely item' },
];

describe('ReaderView', () => {
  it('renders headings, paragraphs and groups consecutive list items', () => {
    const { container } = render(<ReaderView blocks={blocks} settings={DEFAULT_SETTINGS} />);
    expect(screen.getByRole('heading', { level: 2 }).textContent).toBe('Title here');
    expect(container.querySelectorAll('p')).toHaveLength(2);
    const lists = container.querySelectorAll('ul');
    expect(lists).toHaveLength(2);
    expect(lists[0].querySelectorAll('li')).toHaveLength(2);
    expect(lists[1].querySelectorAll('li')).toHaveLength(1);
    expect(container.querySelector('article')).not.toBeNull();
  });

  it('sets data-block-index and CSS variables from settings', () => {
    const { container } = render(
      <ReaderView blocks={blocks} settings={{ ...DEFAULT_SETTINGS, fontSize: 24, font: 'serif' }} />,
    );
    expect(container.querySelector('[data-block-index="1"]')?.tagName).toBe('P');
    expect(container.querySelector('[data-block-index="5"]')?.tagName).toBe('LI');
    const article = container.querySelector('article') as HTMLElement;
    expect(article.style.getPropertyValue('--reader-size')).toBe('24px');
    expect(article.style.getPropertyValue('--reader-measure')).toBe('62ch');
    expect(article.style.getPropertyValue('--reader-font')).toContain('Georgia');
  });

  it('renders <b> when bolding is enabled', () => {
    const { container } = render(<ReaderView blocks={blocks} settings={DEFAULT_SETTINGS} />);
    expect(container.querySelectorAll('b').length).toBeGreaterThan(0);
  });

  it('renders no <b> and preserves text when disabled', () => {
    const { container } = render(
      <ReaderView blocks={blocks} settings={{ ...DEFAULT_SETTINGS, boldEnabled: false }} />,
    );
    expect(container.querySelectorAll('b')).toHaveLength(0);
    expect(container.querySelector('p')?.textContent).toBe('Reading is wonderful today');
  });
});

describe('BoldText', () => {
  it('keeps full text when bolded', () => {
    const { container } = render(<BoldText text="Hello world" />);
    expect(container.textContent).toBe('Hello world');
  });
});
