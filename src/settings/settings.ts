export type Theme = 'system' | 'light' | 'dark' | 'sepia';
export type FontChoice = 'atkinson' | 'system' | 'serif';

export type ReaderSettings = {
  boldEnabled: boolean;
  strength: number;
  fontSize: number;
  lineHeight: number;
  maxWidth: number;
  letterSpacing: number;
  theme: Theme;
  font: FontChoice;
};

export const DEFAULT_SETTINGS: ReaderSettings = {
  boldEnabled: true,
  strength: 0.45,
  fontSize: 20,
  lineHeight: 1.7,
  maxWidth: 62,
  letterSpacing: 0.01,
  theme: 'system',
  font: 'atkinson',
};

export const SETTINGS_KEY = 'letterlift:settings:v1';

const THEMES: readonly Theme[] = ['system', 'light', 'dark', 'sepia'];
const FONTS: readonly FontChoice[] = ['atkinson', 'system', 'serif'];

export type NumericKey =
  | 'strength'
  | 'fontSize'
  | 'lineHeight'
  | 'maxWidth'
  | 'letterSpacing';

export const RANGES: Record<NumericKey, { min: number; max: number }> = {
  strength: { min: 0.2, max: 0.7 },
  fontSize: { min: 16, max: 32 },
  lineHeight: { min: 1.4, max: 2.2 },
  maxWidth: { min: 40, max: 90 },
  letterSpacing: { min: 0, max: 0.12 },
};

function clampNumber(key: NumericKey, value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return DEFAULT_SETTINGS[key];
  }
  const { min, max } = RANGES[key];
  return Math.min(max, Math.max(min, value));
}

function defaultStorage(): Storage | undefined {
  try {
    return typeof localStorage === 'undefined' ? undefined : localStorage;
  } catch {
    return undefined;
  }
}

export function loadSettings(storage?: Storage): ReaderSettings {
  const result: ReaderSettings = { ...DEFAULT_SETTINGS };
  try {
    const store = storage ?? defaultStorage();
    const raw = store?.getItem(SETTINGS_KEY);
    if (!raw) return result;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return result;
    }
    const p = parsed as Record<string, unknown>;
    if (typeof p.boldEnabled === 'boolean') result.boldEnabled = p.boldEnabled;
    for (const key of Object.keys(RANGES) as NumericKey[]) {
      if (key in p) result[key] = clampNumber(key, p[key]);
    }
    if (THEMES.includes(p.theme as Theme)) result.theme = p.theme as Theme;
    if (FONTS.includes(p.font as FontChoice)) result.font = p.font as FontChoice;
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
  return result;
}

export function saveSettings(s: ReaderSettings, storage?: Storage): void {
  try {
    const store = storage ?? defaultStorage();
    store?.setItem(SETTINGS_KEY, JSON.stringify(s));
  } catch {
    // Storage may be blocked or full; the app keeps working without it.
  }
}
