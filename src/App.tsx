import { useCallback, useEffect, useRef, useState } from 'react';
import { About } from './components/About';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { Home } from './components/Home';
import { ReaderScreen } from './components/ReaderScreen';
import { deriveTitle } from './docTitle';
import type { Block } from './ingest';
import { useSettings } from './settings/useSettings';
import styles from './App.module.css';

type Screen = 'home' | 'reader' | 'about';
type Doc = { title: string; blocks: Block[] };

function screenFromLocation(state: unknown): Screen {
  const s = (state as { screen?: Screen } | null)?.screen;
  if (s === 'home' || s === 'reader' || s === 'about') return s;
  return window.location.hash === '#about' ? 'about' : 'home';
}

function urlFor(screen: Screen): string {
  const base = window.location.pathname + window.location.search;
  return screen === 'about' ? `${base}#about` : base;
}

export default function App() {
  // Single source of settings state: call useSettings() once and pass props down.
  const [settings, patchSettings, resetSettings] = useSettings();
  const [screen, setScreen] = useState<Screen>(() => screenFromLocation(null));
  const [doc, setDoc] = useState<Doc | null>(null);
  const [pasted, setPasted] = useState('');
  const mainRef = useRef<HTMLElement>(null);
  const firstRender = useRef(true);

  const go = useCallback((next: Screen) => {
    window.history.pushState({ screen: next }, '', urlFor(next));
    setScreen(next);
  }, []);

  useEffect(() => {
    window.history.replaceState({ screen: screenFromLocation(null) }, '');
    const onPop = (e: PopStateEvent) => setScreen(screenFromLocation(e.state));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Move focus to the new screen so keyboard and screen reader users land at the top.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    mainRef.current?.focus();
  }, [screen]);

  const open = useCallback(
    (blocks: Block[]) => {
      setDoc({ title: deriveTitle(blocks), blocks });
      go('reader');
    },
    [go],
  );

  // A reader URL without a document (e.g. back after reload) falls back to home.
  const shown: Screen = screen === 'reader' && !doc ? 'home' : screen;

  useEffect(() => {
    document.title = shown === 'reader' && doc ? `${doc.title} · LetterLift` : 'LetterLift by Zem';
  }, [shown, doc]);

  return (
    <div className={styles.app}>
      <Header current={shown} onHome={() => go('home')} onAbout={() => go('about')} />
      <main ref={mainRef} tabIndex={-1} className={styles.main}>
        {shown === 'home' && <Home onOpen={open} text={pasted} onTextChange={setPasted} />}
        {shown === 'about' && <About onBack={() => go('home')} />}
        {shown === 'reader' && doc && (
          <ReaderScreen
            blocks={doc.blocks}
            title={doc.title}
            settings={settings}
            patch={patchSettings}
            reset={resetSettings}
            onBack={() => go('home')}
          />
        )}
      </main>
      {shown !== 'reader' && <Footer />}
    </div>
  );
}
