export type Segment = { text: string; bold: boolean };
export type BoldenOptions = { strength?: number; locale?: string };

export const DEFAULT_STRENGTH = 0.45;

const MIN_STRENGTH = 0.1;
const MAX_STRENGTH = 0.9;
const HAS_LETTER = /\p{L}/u;

const segmenters = new Map<string, Intl.Segmenter>();

function getSegmenter(locale: string | undefined): Intl.Segmenter {
  const key = locale ?? '';
  let segmenter = segmenters.get(key);
  if (!segmenter) {
    segmenter = new Intl.Segmenter(locale, { granularity: 'word' });
    segmenters.set(key, segmenter);
  }
  return segmenter;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function push(out: Segment[], text: string, bold: boolean): void {
  if (text === '') return;
  const last = out[out.length - 1];
  if (last && last.bold === bold) {
    last.text += text;
  } else {
    out.push({ text, bold });
  }
}

/**
 * Splits text into segments, bolding the beginning of each word.
 * Concatenating all segment texts always yields the original input.
 */
export function bolden(text: string, options: BoldenOptions = {}): Segment[] {
  if (text === '') return [];

  const raw = options.strength ?? DEFAULT_STRENGTH;
  const strength = clamp(Number.isNaN(raw) ? DEFAULT_STRENGTH : raw, MIN_STRENGTH, MAX_STRENGTH);
  const out: Segment[] = [];

  for (const { segment, isWordLike } of getSegmenter(options.locale).segment(text)) {
    if (isWordLike === true && HAS_LETTER.test(segment)) {
      const chars = Array.from(segment);
      const count = clamp(Math.round(chars.length * strength), 1, chars.length);
      push(out, chars.slice(0, count).join(''), true);
      push(out, chars.slice(count).join(''), false);
    } else {
      push(out, segment, false);
    }
  }

  return out;
}
