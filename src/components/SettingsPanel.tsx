import { useEffect, useId, useRef, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react';
import { useI18n } from '../i18n';
import {
  RANGES,
  type FontChoice,
  type NumericKey,
  type ReaderSettings,
  type Theme,
} from '../settings/settings';
import { snapToStep } from '../settings/snap';
import { FONT_STACKS } from './ReaderView';
import type { FocusTools } from './useFocusTools';
import styles from './SettingsPanel.module.css';

type Props = {
  settings: ReaderSettings;
  patch: (p: Partial<ReaderSettings>) => void;
  reset: () => void;
  focus: FocusTools;
  onFocusChange: (p: Partial<FocusTools>) => void;
  onClose: () => void;
};

const FOCUSABLE =
  'button:not([disabled]), input:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';

const FONTS: FontChoice[] = ['atkinson', 'system', 'serif'];
const THEMES: Theme[] = ['system', 'light', 'dark', 'sepia'];

const STEPS: Record<NumericKey, number> = {
  strength: 0.05,
  fontSize: 1,
  lineHeight: 0.1,
  maxWidth: 2,
  letterSpacing: 0.01,
};

const FORMAT: Record<NumericKey, (v: number) => string> = {
  strength: (v) => `${Math.round(v * 100)}%`,
  fontSize: (v) => `${v} px`,
  lineHeight: (v) => v.toFixed(1),
  maxWidth: (v) => String(v),
  letterSpacing: (v) => v.toFixed(2),
};

function Check() {
  return (
    <svg className={styles.check} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <circle cx="8" cy="8" r="8" fill="currentColor" />
      <path
        d="M4.6 8.4l2.3 2.3 4.5-4.9"
        fill="none"
        stroke="var(--on-accent)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Switch(props: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  const hintId = useId();
  return (
    <label className={styles.switchRow}>
      <span className={styles.switchText}>
        <span className={styles.switchLabel}>{props.label}</span>
        {props.hint && (
          <span className={styles.hint} id={hintId}>
            {props.hint}
          </span>
        )}
      </span>
      <input
        type="checkbox"
        role="switch"
        className={styles.switch}
        checked={props.checked}
        aria-describedby={props.hint ? hintId : undefined}
        onChange={(e) => props.onChange(e.target.checked)}
      />
    </label>
  );
}

export function SettingsPanel({ settings, patch, reset, focus, onFocusChange, onClose }: Props) {
  const { t } = useI18n();
  const sheetRef = useRef<HTMLElement>(null);
  const titleId = useId();
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Move focus into the sheet on open; give it back to the trigger on close.
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    sheetRef.current?.focus();
    return () => {
      if (previous && previous.isConnected) previous.focus();
    };
  }, []);

  // Esc closes; focus that escapes the sheet is pulled back in.
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCloseRef.current();
      }
    };
    const onFocusIn = (e: FocusEvent) => {
      const sheet = sheetRef.current;
      if (sheet && e.target instanceof Node && !sheet.contains(e.target)) sheet.focus();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('focusin', onFocusIn);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('focusin', onFocusIn);
    };
  }, []);

  const trapTab = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    const sheet = sheetRef.current;
    if (!sheet) return;
    const items = Array.from(sheet.querySelectorAll<HTMLElement>(FOCUSABLE));
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement;
    if (e.shiftKey && (active === first || active === sheet)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const slider = (key: NumericKey, label: string, disabled = false): ReactNode => {
    const { min, max } = RANGES[key];
    const step = STEPS[key];
    const value = settings[key];
    const id = `${titleId}-${key}`;
    const fill = ((value - min) / (max - min)) * 100;
    return (
      <div className={styles.field}>
        <label htmlFor={id} className={styles.fieldLabel}>
          {label}
        </label>
        <output htmlFor={id} className={styles.value}>
          {FORMAT[key](value)}
        </output>
        <input
          id={id}
          type="range"
          className={styles.range}
          style={{ '--fill': `${fill}%` } as CSSProperties}
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onChange={(e) =>
            patch({ [key]: snapToStep(Number(e.target.value), min, max, step) })
          }
        />
      </div>
    );
  };

  return (
    <div className={styles.layer} data-no-print>
      <div className={styles.backdrop} onClick={onClose} aria-hidden="true" data-testid="panel-backdrop" />
      <section
        ref={sheetRef}
        className={styles.sheet}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onKeyDown={trapTab}
      >
        <header className={styles.head}>
          <div className={styles.grab} aria-hidden="true" />
          <h2 id={titleId} className={styles.title}>
            {t.panel.title}
          </h2>
          <button type="button" className={styles.close} onClick={onClose} aria-label={t.panel.close}>
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" fill="none" />
            </svg>
          </button>
        </header>

        <div className={styles.body}>
          <p className={styles.intro}>{t.panel.intro}</p>

          <div className={styles.group}>
            <Switch
              label={t.panel.bold}
              checked={settings.boldEnabled}
              onChange={(v) => patch({ boldEnabled: v })}
            />
            {slider('strength', t.panel.strength, !settings.boldEnabled)}
          </div>

          <div className={styles.group} role="group" aria-label={t.panel.textGroup}>
            {slider('fontSize', t.panel.fontSize)}
            {slider('lineHeight', t.panel.lineHeight)}
            {slider('maxWidth', t.panel.maxWidth)}
            {slider('letterSpacing', t.panel.letterSpacing)}
          </div>

          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>{t.panel.font}</legend>
            <div className={styles.swatches} data-cols="3">
              {FONTS.map((f) => (
                <label key={f} className={styles.swatch}>
                  <input
                    type="radio"
                    name="reader-font"
                    className={styles.radio}
                    checked={settings.font === f}
                    onChange={() => patch({ font: f })}
                  />
                  <span className={styles.swatchBody}>
                    <span className={styles.chip} style={{ fontFamily: FONT_STACKS[f] }} aria-hidden="true">
                      <b>A</b>a
                    </span>
                    <span className={styles.swatchName}>{t.panel.fonts[f]}</span>
                    <Check />
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>{t.panel.theme}</legend>
            <div className={styles.swatches} data-cols="4">
              {THEMES.map((th) => (
                <label key={th} className={styles.swatch}>
                  <input
                    type="radio"
                    name="reader-theme"
                    className={styles.radio}
                    checked={settings.theme === th}
                    onChange={() => patch({ theme: th })}
                  />
                  <span className={styles.swatchBody}>
                    <span className={styles.chip} data-theme-swatch={th} aria-hidden="true">
                      <b>A</b>a
                    </span>
                    <span className={styles.swatchName}>{t.panel.themes[th]}</span>
                    <Check />
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className={styles.group} role="group" aria-label={t.panel.focusGroup}>
            <Switch
              label={t.panel.ruler}
              hint={t.panel.rulerHint}
              checked={focus.ruler}
              onChange={(v) => onFocusChange({ ruler: v })}
            />
            <Switch
              label={t.panel.paragraph}
              hint={t.panel.paragraphHint}
              checked={focus.paragraph}
              onChange={(v) => onFocusChange({ paragraph: v })}
            />
          </div>

          <button type="button" className={styles.reset} onClick={reset}>
            {t.panel.reset}
          </button>
        </div>
      </section>
    </div>
  );
}
