import { useCallback, useEffect, useRef, useState } from 'react';
import { About } from './components/About';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { Home } from './components/Home';
import { Privacy } from './components/Privacy';
import { ReaderScreen } from './components/ReaderScreen';
import { deriveTitle } from './docTitle';
import { parsePlainText, type Block } from './ingest';
import { readSharedText } from './share';
import { useI18n } from './i18n';
import { useSettings } from './settings/useSettings';
import styles from './App.module.css';

type Screen = 'home' | 'reader' | 'about' | 'privacy';
type Doc = { title: string; blocks: Block[] };

function screenFromLocation(state: unknown): Screen {
  const s = (state as { screen?: Screen } | null)?.screen;
  if (s === 'home' || s === 'reader' || s === 'about' || s === 'privacy') return s;
  if (window.location.hash === '#about') return 'about';
  return window.location.hash === '#privacy' ? 'privacy' : 'home';
}

function urlFor(screen: Screen): string {
  const base = window.location.pathname + window.location.search;
  return screen === 'about' || screen === 'privacy' ? `${base}#${screen}` : base;
}

export default function App() {
  // Single source of settings state: call useSettings() once and pass props down.
  const { t } = useI18n();
  const [settings, patchSettings, resetSettings] = useSettings();
  const [screen, setScreen] = useState<Screen>(() => screenFromLocation(null));
  const [doc, setDoc] = useState<Doc | null>(null);
  const [pasted, setPasted] = useState('');
  const mainRef = useRef<HTMLElement>(null);
  const firstRender = useRef(true);

  const go = useCallback((next: Screen) => {
    const idx = ((window.history.state as { idx?: number } | null)?.idx ?? 0) + 1;
    window.history.pushState({ screen: next, idx }, '', urlFor(next));
    // Forward navigation starts at the top; popstate leaves scroll to the browser.
    window.scrollTo(0, 0);
    setScreen(next);
  }, []);

  // Back from About/Privacy returns to the in-app screen we came from, else home.
  const back = useCallback(() => {
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
    if (idx > 0) window.history.back();
    else go('home');
  }, [go]);

  useEffect(() => {
    window.history.replaceState({ screen: screenFromLocation(null), idx: 0 }, '');
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
    mainRef.current?.focus({ preventScroll: true });
  }, [screen]);

  const open = useCallback(
    (blocks: Block[]) => {
      setDoc({ title: deriveTitle(blocks), blocks });
      go('reader');
    },
    [go],
  );

  // Android "Share -> LetterLift": open shared text straight in the reader, then drop the query.
  useEffect(() => {
    const shared = readSharedText(window.location.search);
    if (!shared) return;
    window.history.replaceState({ screen: 'home' }, '', window.location.pathname + window.location.hash);
    open(parsePlainText(shared));
  }, [open]);

  // A reader URL without a document (e.g. back after reload) falls back to home.
  const shown: Screen = screen === 'reader' && !doc ? 'home' : screen;

  useEffect(() => {
    if (shown === 'reader' && doc) document.title = `${doc.title} · LetterLift`;
    else if (shown === 'privacy') document.title = `${t.legal.title} · LetterLift`;
    else document.title = 'LetterLift by Zem';
  }, [shown, doc, t.legal.title]);

  return (
    <div className={styles.app}>
      <Header current={shown} onHome={() => go('home')} onAbout={() => go('about')} />
      <main ref={mainRef} tabIndex={-1} className={styles.main}>
        {shown === 'home' && <Home onOpen={open} text={pasted} onTextChange={setPasted} />}
        {shown === 'about' && <About onBack={back} onPrivacy={() => go('privacy')} />}
        {shown === 'privacy' && <Privacy onBack={back} />}
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
      {shown !== 'reader' && <Footer onPrivacy={() => go('privacy')} />}
    </div>
  );
}
