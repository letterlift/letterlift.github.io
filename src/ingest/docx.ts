import mammoth from 'mammoth';
import { htmlToBlocks } from './html';
import type { Block } from './types';

export async function docxToBlocks(file: File): Promise<Block[]> {
  const arrayBuffer = await file.arrayBuffer();
  const { value } = await mammoth.convertToHtml(
    { arrayBuffer },
    // Drop images: no base64 blobs in the text pipeline.
    { convertImage: mammoth.images.imgElement(() => Promise.resolve({ src: '' })) },
  );
  return htmlToBlocks(value);
}
