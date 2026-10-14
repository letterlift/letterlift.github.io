import type { Block } from './ingest';

/** Title for a document: first heading, otherwise the first ~6 words. */
export function deriveTitle(blocks: Block[]): string {
  const heading = blocks.find((b) => b.type === 'heading' && b.text.trim());
  const source = (heading ?? blocks.find((b) => b.text.trim()))?.text.trim() ?? '';
  const words = source.split(/\s+/).filter(Boolean);
  if (heading || words.length <= 6) return source;
  return `${words.slice(0, 6).join(' ')}…`;
}
