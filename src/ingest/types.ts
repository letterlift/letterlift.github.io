export type BlockType = 'heading' | 'paragraph' | 'list-item';
export type Block = { type: BlockType; text: string };
export type IngestErrorCode =
  | 'unsupported'
  | 'too-large'
  | 'empty'
  | 'no-text-in-pdf'
  | 'read-failed';

export class IngestError extends Error {
  public code: IngestErrorCode;
  constructor(code: IngestErrorCode, message?: string) {
    super(message ?? code);
    this.name = 'IngestError';
    this.code = code;
  }
}

export const MAX_FILE_BYTES = 20 * 1024 * 1024;
