import * as pdfjs from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { parsePlainText } from './plainText';
import { IngestError, type Block } from './types';

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

export async function pdfToBlocks(file: File): Promise<Block[]> {
  const data = new Uint8Array(await file.arrayBuffer());
  const task = pdfjs.getDocument({ data });
  const pdf = await task.promise;
  try {
    const pages: string[] = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      let text = '';
      for (const item of content.items) {
        if (!('str' in item)) continue;
        text += item.str;
        if (item.hasEOL) text += '\n';
      }
      pages.push(text);
    }
    const all = pages.join('\n\n');
    if (!/\p{L}/u.test(all)) throw new IngestError('no-text-in-pdf');
    return parsePlainText(all);
  } finally {
    void task.destroy();
  }
}
