import { describe, expect, it } from 'vitest';
import { ingestFile } from './index';
import { IngestError, MAX_FILE_BYTES } from './types';

async function codeOf(p: Promise<unknown>): Promise<string | undefined> {
  try {
    await p;
  } catch (e) {
    return e instanceof IngestError ? e.code : 'other';
  }
  return undefined;
}

describe('ingestFile', () => {
  it('rejects files over the size limit', async () => {
    const file = new File(['x'], 'big.txt', { type: 'text/plain' });
    Object.defineProperty(file, 'size', { value: MAX_FILE_BYTES + 1 });
    expect(await codeOf(ingestFile(file))).toBe('too-large');
  });

  it('rejects unsupported types', async () => {
    const file = new File(['x'], 'pic.png', { type: 'image/png' });
    expect(await codeOf(ingestFile(file))).toBe('unsupported');
  });

  it('rejects an empty TXT', async () => {
    const file = new File(['  \n\n '], 'e.txt', { type: 'text/plain' });
    expect(await codeOf(ingestFile(file))).toBe('empty');
  });

  it('parses a TXT file into blocks', async () => {
    const file = new File(['# Hi\n\nSome text'], 'a.txt', { type: 'text/plain' });
    expect(await ingestFile(file)).toEqual([
      { type: 'heading', text: 'Hi' },
      { type: 'paragraph', text: 'Some text' },
    ]);
  });

  it('detects by extension case-insensitively (.MD with empty MIME)', async () => {
    const file = new File(['- a'], 'NOTES.MD');
    expect(await ingestFile(file)).toEqual([{ type: 'list-item', text: 'a' }]);
  });

  it('prefers the extension over a misleading MIME type', async () => {
    // Not a real PDF: if routed to the PDF adapter it fails with read-failed, not text parsing.
    const file = new File(['hello'], 'x.pdf', { type: 'text/plain' });
    expect(await codeOf(ingestFile(file))).toBe('read-failed');
  });
});
