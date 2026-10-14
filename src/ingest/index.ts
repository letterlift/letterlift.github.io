import { parsePlainText } from './plainText';
import { IngestError, MAX_FILE_BYTES, type Block } from './types';

export * from './types';
export { parsePlainText } from './plainText';
export { htmlToBlocks } from './html';

type Kind = 'text' | 'docx' | 'pdf';

function detectKind(file: File): Kind | null {
  const name = file.name.toLowerCase();
  const mime = file.type.toLowerCase();
  if (name.endsWith('.txt') || name.endsWith('.md') || mime === 'text/plain') return 'text';
  if (
    name.endsWith('.docx') ||
    mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return 'docx';
  }
  if (name.endsWith('.pdf') || mime === 'application/pdf') return 'pdf';
  return null;
}

export async function ingestFile(file: File): Promise<Block[]> {
  if (file.size > MAX_FILE_BYTES) throw new IngestError('too-large');
  const kind = detectKind(file);
  if (!kind) throw new IngestError('unsupported');

  let blocks: Block[];
  try {
    if (kind === 'text') {
      blocks = parsePlainText(await file.text());
    } else if (kind === 'docx') {
      blocks = await (await import('./docx')).docxToBlocks(file);
    } else {
      blocks = await (await import('./pdf')).pdfToBlocks(file);
    }
  } catch (e) {
    if (e instanceof IngestError) throw e;
    throw new IngestError('read-failed', e instanceof Error ? e.message : undefined);
  }

  if (blocks.length === 0) throw new IngestError('empty');
  return blocks;
}
