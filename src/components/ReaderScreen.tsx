import { useCallback, useEffect, useRef, useState } from 'react';
import { readingTime } from '../core/readingTime';
import { useI18n } from '../i18n';
import type { Block } from '../ingest/types';
import type { ReaderSettings } from '../settings/settings';
import { ProgressBar } from './ProgressBar';
import { ReaderView, readerStyle } from './ReaderView';
import { ReadingRuler } from './ReadingRuler';
import { SettingsPanel } from './SettingsPanel';
import { useFocusTools } from './useFocusTools';
import styles from './ReaderScreen.module.css';

type Props = {
  blocks: Block[];
  title: string;
  settings: ReaderSettings;
  patch: (p: Partial<ReaderSettings>) => void;
  reset: () => void;
  onBack: () => void;
};

type CopyState = 'idle' | 'ok' | 'fail';

/** Plain text of the document: blocks separated by blank lines, list items by single newlines. */
export function toPlainText(blocks: Block[]): string {
  let out = '';
  blocks.forEach((b, i) => {
    const prev = blocks[i - 1];
    const sep = i === 0 ? '' : b.type === 'list-item' && prev?.type === 'list-item' ? '\n' : '\n\n';
    out += sep + (b.type === 'list-item' ? `- ${b.text}` : b.text);
  });
  return out;
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to the legacy path
  }
  try {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = typeof document.execCommand === 'function' && document.execCommand('copy');
    area.remove();
    return ok;
  } catch {
    return false;
  }
}

/** Index of the block whose centre is nearest the middle of the viewport (blocks are in document order). */
function nearestToCentre(nodes: HTMLElement[]): HTMLElement | null {
  if (nodes.length === 0) return null;
  const mid = window.innerHeight / 2;
  let lo = 0;
  let hi = nodes.length - 1;
  while (lo < hi) {
    const m = (lo + hi) >> 1;
    if (nodes[m].getBoundingClientRect().bottom >= mid) hi = m;
    else lo = m + 1;
  }
  const dist = (el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    return r.top > mid ? r.top - mid : r.bottom < mid ? mid - r.bottom : 0;
  };
  const prev = nodes[lo - 1];
  return prev && dist(prev) < dist(nodes[lo]) ? prev : nodes[lo];
}

const icon = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  focusable: false,
};

export function ReaderScreen({ blocks, title, settings, patch, reset, onBack }: Props) {
  const { t } = useI18n();
  const [panelOpen, setPanelOpen] = useState(false);
  const [focus, patchFocus] = useFocusTools();
  const [copyState, setCopyState] = useState<CopyState>('idle');
  const screenRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const minutes = readingTime(blocks);
  const shownTitle = title || t.reader.untitled;
  const rulerHeight = Math.round(settings.fontSize * settings.lineHeight * 1.6);

  useEffect(() => () => clearTimeout(copyTimer.current), []);

  // Paragraph focus: mark the block nearest the viewport centre; CSS dims the rest.
  useEffect(() => {
    const body = bodyRef.current;
    if (!focus.paragraph || !body) return;
    const nodes = Array.from(body.querySelectorAll<HTMLElement>('[data-block-index]'));
    let active: HTMLElement | null = null;
    let frame = 0;
    const update = () => {
      frame = 0;
      const next = nearestToCentre(nodes);
      if (next === active) return;
      active?.removeAttribute('data-focus-active');
      next?.setAttribute('data-focus-active', 'true');
      active = next;
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frame) cancelAnimationFrame(frame);
      active?.removeAttribute('data-focus-active');
    };
    // Layout settings shift block positions without a scroll event, so re-run on them too.
  }, [
    focus.paragraph,
    blocks,
    settings.fontSize,
    settings.lineHeight,
    settings.maxWidth,
    settings.letterSpacing,
    settings.font,
  ]);

  const onCopy = useCallback(async () => {
    const ok = await copyToClipboard(toPlainText(blocks));
    setCopyState(ok ? 'ok' : 'fail');
    clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopyState('idle'), 2600);
  }, [blocks]);

  const status =
    copyState === 'ok' ? t.reader.copied : copyState === 'fail' ? t.reader.copyFailed : '';

  return (
    <div ref={screenRef} className={styles.screen}>
      <ProgressBar targetRef={bodyRef} />

      <div className={styles.bar} data-no-print>
        <div className={styles.barInner}>
          <button type="button" className={styles.back} onClick={onBack}>
            {t.reader.back}
          </button>

          <div className={styles.meta}>
            <span className={styles.docName} aria-hidden="true">
              {shownTitle}
            </span>
            <span className={styles.time}>{t.reader.readingTime(minutes)}</span>
          </div>

          <div className={styles.actions} role="group" aria-label={t.reader.toolbar}>
            <button type="button" className={styles.iconBtn} onClick={onCopy} data-state={copyState}>
              <svg {...icon}>
                <rect x="9" y="9" width="11" height="11" rx="2.5" />
                <path d="M5 15V6.5A2.5 2.5 0 0 1 7.5 4H15" />
              </svg>
              <span className={styles.label}>
                {copyState === 'ok' ? t.reader.copied : t.reader.copy}
              </span>
            </button>
            <button type="button" className={styles.iconBtn} onClick={() => window.print()}>
              <svg {...icon}>
                <path d="M7 9V4h10v5" />
                <rect x="4" y="9" width="16" height="8" rx="2.5" />
                <path d="M7 14h10v6H7z" />
              </svg>
              <span className={styles.label}>{t.reader.print}</span>
            </button>
            <button
              type="button"
              className={`${styles.iconBtn} ${styles.primary}`}
              onClick={() => setPanelOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={panelOpen}
            >
              <svg {...icon}>
                <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
                <circle cx="15" cy="7" r="2.2" />
                <circle cx="9" cy="17" r="2.2" />
              </svg>
              <span className={styles.label}>{t.reader.settings}</span>
            </button>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <div
          ref={bodyRef}
          className={`${styles.body} ${focus.paragraph ? styles.dimming : ''}`}
          style={readerStyle(settings)}
          data-testid="reader-body"
        >
          <div className={styles.titleBox}>
            <h1 className={styles.docTitle}>{shownTitle}</h1>
          </div>
          <ReaderView blocks={blocks} settings={settings} />
        </div>
      </div>

      <ReadingRuler enabled={focus.ruler} height={rulerHeight} targetRef={screenRef} />

      {panelOpen && (
        <SettingsPanel
          settings={settings}
          patch={patch}
          reset={reset}
          focus={focus}
          onFocusChange={patchFocus}
          onClose={() => setPanelOpen(false)}
        />
      )}

      <p className={styles.srOnly} role="status" aria-live="polite">
        {status}
      </p>
    </div>
  );
}
