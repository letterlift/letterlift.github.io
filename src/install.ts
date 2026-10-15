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

/** Share to LetterLift only exists on phones and tablets, so only offer install there. */
function isTouchDevice(win: Window): boolean {
  return typeof win.matchMedia === 'function' && win.matchMedia('(pointer: coarse)').matches;
}

/** Registered at import time: Chrome may fire the event before React mounts. */
export function listenForInstall(win: Window = window) {
  win.addEventListener('beforeinstallprompt', (e) => {
    // On desktop leave the browser's own install UI alone.
    if (!isTouchDevice(win)) return;
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
  try {
    await e.prompt();
    const { outcome } = await e.userChoice;
    set(outcome === 'accepted' ? 'installed' : 'unavailable');
    return outcome === 'accepted';
  } catch {
    set('unavailable');
    return false;
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): InstallState {
  return state;
}

export function useInstallState(): InstallState {
  return useSyncExternalStore(subscribe, getSnapshot);
}

/** Test helper. */
export function resetInstallForTests() {
  deferred = null;
  state = 'unavailable';
  listeners.forEach((l) => l());
}
