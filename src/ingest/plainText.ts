import type { Block } from './types';

const HEADING = /^#{1,6}[ \t ]+(.*)$/;
const LIST_ITEM = /^(?:[-*•]|\d+[.)])[ \t ]+(.*)$/;

function clean(s: string): string {
  return s.replace(/[ \t ]+/g, ' ').trim();
}

/** Appends a line to a paragraph buffer, undoing end-of-line hyphenation. */
function appendLine(buffer: string, line: string): string {
  if (buffer === '') return line;
  if (/\p{L}-$/u.test(buffer) && /^\p{Ll}/u.test(line)) {
    return buffer.slice(0, -1) + line;
  }
  return `${buffer} ${line}`;
}

export function parsePlainText(text: string): Block[] {
  const blocks: Block[] = [];
  const chunks = text.replace(/\r\n?/g, '\n').split(/\n\s*\n/);

  for (const chunk of chunks) {
    let paragraph = '';
    const flush = () => {
      const t = clean(paragraph);
      if (t) blocks.push({ type: 'paragraph', text: t });
      paragraph = '';
    };

    for (const rawLine of chunk.split('\n')) {
      const line = rawLine.trimStart();
      const heading = HEADING.exec(line);
      const item = heading ? null : LIST_ITEM.exec(line);
      if (heading || item) {
        flush();
        const t = clean((heading ?? item)![1]);
        if (t) blocks.push({ type: heading ? 'heading' : 'list-item', text: t });
        continue;
      }
      const cleaned = clean(line);
      if (cleaned) paragraph = appendLine(paragraph, cleaned);
    }
    flush();
  }
  return blocks;
}
