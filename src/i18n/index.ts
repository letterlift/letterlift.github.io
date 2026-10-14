import { useCallback, useEffect, useSyncExternalStore } from 'react';
import { pl } from './pl';
import { en } from './en';

type Widen<T> = T extends string
  ? string
  : T extends (...args: never[]) => unknown
    ? T
    : T extends readonly unknown[]
      ? string[]
      : { [K in keyof T]: Widen<T[K]> };

export type Dict = Widen<typeof pl>;
export type Lang = 'pl' | 'en';

export const LANG_KEY = 'letterlift:lang';
const DICTS: Record<Lang, Dict> = { pl, en };

export function detectLang(
  navLang: string | undefined = typeof navigator === 'undefined' ? undefined : navigator.language,
): Lang {
  return navLang?.toLowerCase().startsWith('pl') ? 'pl' : 'en';
}

function readStoredLang(): Lang | null {
  try {
    const v = localStorage.getItem(LANG_KEY);
    return v === 'pl' || v === 'en' ? v : null;
  } catch {
    return null;
  }
}

let current: Lang | null = null;
const listeners = new Set<() => void>();

function getLang(): Lang {
  if (current === null) current = readStoredLang() ?? detectLang();
  return current;
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function setLangValue(lang: Lang) {
  current = lang;
  try {
    localStorage.setItem(LANG_KEY, lang);
  } catch {
    // Storage may be blocked; the choice still applies for this session.
  }
  listeners.forEach((l) => l());
}

/** Test helper: forget the cached language so detection runs again. */
export function resetLangForTests() {
  current = null;
  listeners.forEach((l) => l());
}

export function useI18n(): { t: Dict; lang: Lang; setLang: (lang: Lang) => void } {
  const lang = useSyncExternalStore(subscribe, getLang, getLang);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  const setLang = useCallback((l: Lang) => setLangValue(l), []);
  return { t: DICTS[lang], lang, setLang };
}
