import type { Block, BlockType } from './types';

const HEADINGS = new Set(['H1', 'H2', 'H3', 'H4', 'H5', 'H6']);
const BLOCK_SELECTOR = 'h1,h2,h3,h4,h5,h6,li,p,blockquote';

function collapse(s: string | null): string {
  return (s ?? '').replace(/\s+/g, ' ').trim();
}

function typeOf(el: Element): BlockType | null {
  if (HEADINGS.has(el.tagName)) return 'heading';
  if (el.tagName === 'LI') return 'list-item';
  if (el.tagName === 'P' || el.tagName === 'BLOCKQUOTE') return 'paragraph';
  return null;
}

export function htmlToBlocks(html: string): Block[] {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll('script, style').forEach((el) => el.remove());

  const blocks: Block[] = [];
  const push = (type: BlockType, text: string | null) => {
    const t = collapse(text);
    if (t) blocks.push({ type, text: t });
  };

  const walk = (node: Node) => {
    node.childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        push('paragraph', child.textContent);
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const el = child as Element;
        const type = typeOf(el);
        if (type) {
          push(type, el.textContent);
        } else if (el.querySelector(BLOCK_SELECTOR)) {
          walk(el);
        } else {
          // Container or inline element without block children (div, span, td...).
          push('paragraph', el.textContent);
        }
      }
    });
  };

  walk(doc.body);
  return blocks;
}
