import { useSyncExternalStore } from 'react';

/** Chrome's install prompt event (not in the TS DOM lib). */
type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

export type InstallState = 'unavailable' | 'available' | 'installed';

let deferred: InstallPromptEvent | null = null;
let state: InstallState = 'unavailable';
const listeners = new Set<() => void>();

function set(next: InstallState) {
  state = next;
  listeners.forEach((l) => l());
}

/** Registered at import time: Chrome may fire the event before React mounts. */
export function listenForInstall(win: Window = window) {
  win.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e as InstallPromptEvent;
    set('available');
  });
  win.addEventListener('appinstalled', () => {
    deferred = null;
    set('installed');
  });
}

if (typeof window !== 'undefined') listenForInstall();

/** Opens the browser's install dialog. Resolves true when the user accepted. */
export async function promptInstall(): Promise<boolean> {
  const e = deferred;
  if (!e) return false;
  deferred = null;
  await e.prompt();
  const { outcome } = await e.userChoice;
  set(outcome === 'accepted' ? 'installed' : 'unavailable');
  return outcome === 'accepted';
}

export function useInstallState(): InstallState {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state,
  );
}

/** Test helper. */
export function resetInstallForTests() {
  deferred = null;
  state = 'unavailable';
  listeners.forEach((l) => l());
}
