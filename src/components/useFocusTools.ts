import { useCallback, useEffect, useState } from 'react';

export type FocusTools = { ruler: boolean; paragraph: boolean };

export const FOCUS_KEY = 'letterlift:focus:v1';
const OFF: FocusTools = { ruler: false, paragraph: false };

function load(): FocusTools {
  try {
    const raw = localStorage.getItem(FOCUS_KEY);
    if (!raw) return OFF;
    const p: unknown = JSON.parse(raw);
    if (typeof p !== 'object' || p === null) return OFF;
    const o = p as Record<string, unknown>;
    return { ruler: o.ruler === true, paragraph: o.paragraph === true };
  } catch {
    return OFF;
  }
}

/** Reading-ruler and paragraph-focus toggles, remembered between visits. */
export function useFocusTools(): [FocusTools, (patch: Partial<FocusTools>) => void] {
  const [tools, setTools] = useState<FocusTools>(load);

  useEffect(() => {
    try {
      localStorage.setItem(FOCUS_KEY, JSON.stringify(tools));
    } catch {
      // Storage may be blocked; the toggles still work for this session.
    }
  }, [tools]);

  const patch = useCallback(
    (p: Partial<FocusTools>) => setTools((prev) => ({ ...prev, ...p })),
    [],
  );
  return [tools, patch];
}
