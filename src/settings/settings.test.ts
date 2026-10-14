import { describe, expect, it } from 'vitest';
import {
  DEFAULT_SETTINGS,
  SETTINGS_KEY,
  loadSettings,
  saveSettings,
} from './settings';

function fakeStorage(initial?: string): Storage {
  const data = new Map<string, string>();
  if (initial !== undefined) data.set(SETTINGS_KEY, initial);
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
    removeItem: (k: string) => void data.delete(k),
    clear: () => data.clear(),
    key: () => null,
    get length() {
      return data.size;
    },
  };
}

const throwing = (): Storage => {
  const boom = () => {
    throw new Error('blocked');
  };
  return {
    getItem: boom,
    setItem: boom,
    removeItem: boom,
    clear: boom,
    key: boom,
    length: 0,
  } as unknown as Storage;
};

describe('loadSettings', () => {
  it('returns defaults when nothing is stored', () => {
    expect(loadSettings(fakeStorage())).toEqual(DEFAULT_SETTINGS);
  });

  it('merges valid stored values over defaults', () => {
    const stored = { fontSize: 24, theme: 'dark', font: 'serif', boldEnabled: false };
    const s = loadSettings(fakeStorage(JSON.stringify(stored)));
    expect(s).toEqual({ ...DEFAULT_SETTINGS, ...stored });
  });

  it('clamps numeric fields to range', () => {
    const s = loadSettings(
      fakeStorage(
        JSON.stringify({ strength: 5, fontSize: 1, lineHeight: 9, maxWidth: -3, letterSpacing: 1 }),
      ),
    );
    expect(s.strength).toBe(0.7);
    expect(s.fontSize).toBe(16);
    expect(s.lineHeight).toBe(2.2);
    expect(s.maxWidth).toBe(40);
    expect(s.letterSpacing).toBe(0.12);
  });

  it('falls back to defaults for wrong types and invalid enums', () => {
    const s = loadSettings(
      fakeStorage(
        JSON.stringify({ strength: 'x', fontSize: null, theme: 'neon', font: 3, boldEnabled: 'yes' }),
      ),
    );
    expect(s).toEqual(DEFAULT_SETTINGS);
  });

  it('ignores invalid JSON and non-object JSON', () => {
    expect(loadSettings(fakeStorage('{nope'))).toEqual(DEFAULT_SETTINGS);
    expect(loadSettings(fakeStorage('[1,2]'))).toEqual(DEFAULT_SETTINGS);
    expect(loadSettings(fakeStorage('null'))).toEqual(DEFAULT_SETTINGS);
  });

  it('never throws when storage throws', () => {
    expect(loadSettings(throwing())).toEqual(DEFAULT_SETTINGS);
  });
});

describe('saveSettings', () => {
  it('round-trips through storage', () => {
    const st = fakeStorage();
    const s = { ...DEFAULT_SETTINGS, fontSize: 28, theme: 'sepia' as const };
    saveSettings(s, st);
    expect(loadSettings(st)).toEqual(s);
  });

  it('never throws when storage throws', () => {
    expect(() => saveSettings(DEFAULT_SETTINGS, throwing())).not.toThrow();
  });
});
