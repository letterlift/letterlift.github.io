import { useEffect, useId, useMemo, useState } from 'react';
import { DEFAULT_STRENGTH } from '../core';
import { useI18n } from '../i18n';
import { BoldText } from './BoldText';
import styles from './HeroDemo.module.css';

function prefersReducedMotion(): boolean {
  // No matchMedia (e.g. jsdom): skip the animation and show the final state.
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return true;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

const STEP_MS = 140;

export function HeroDemo() {
  const { t } = useI18n();
  const sliderId = useId();
  const [strength, setStrength] = useState(DEFAULT_STRENGTH);
  const [enabled, setEnabled] = useState(true);

  const words = useMemo(() => t.demo.sample.split(' '), [t.demo.sample]);

  // Words get bolded one by one, once on mount. `revealed` = how many are done.
  const [revealed, setRevealed] = useState(() => (prefersReducedMotion() ? Infinity : 0));
  useEffect(() => {
    if (prefersReducedMotion()) return;
    setRevealed(0);
    let n = 0;
    const id = window.setInterval(() => {
      n += 1;
      setRevealed((r) => Math.max(r, n));
      if (n >= words.length) window.clearInterval(id);
    }, STEP_MS);
    return () => window.clearInterval(id);
    // Run once per language change of the sample, not on slider moves.
  }, [words.length]);

  return (
    <section className={styles.card} aria-labelledby={`${sliderId}-title`}>
      <h2 id={`${sliderId}-title`} className={styles.title}>
        {t.demo.title}
      </h2>

      <p className={styles.sample}>
        {words.map((w, i) => (
          <span key={i}>
            <BoldText text={w} strength={strength} enabled={enabled && i < revealed} />
            {i < words.length - 1 ? ' ' : ''}
          </span>
        ))}
      </p>

      <div className={styles.controls}>
        <div className={styles.field}>
          <label htmlFor={sliderId} className={styles.label}>
            {t.demo.strength}
          </label>
          <input
            id={sliderId}
            className={styles.range}
            type="range"
            min={0.2}
            max={0.7}
            step={0.05}
            value={strength}
            disabled={!enabled}
            onChange={(e) => setStrength(Number(e.target.value))}
          />
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          className={styles.toggle}
          onClick={() => {
            setEnabled((v) => !v);
            setRevealed(Infinity);
          }}
        >
          <span className={styles.track} aria-hidden="true">
            <span className={styles.thumb} />
          </span>
          <span className={styles.toggleText}>
            <span>{t.demo.toggle}</span>
            <span className={styles.state}>{enabled ? t.demo.on : t.demo.off}</span>
          </span>
        </button>
      </div>

      <p className={styles.hint}>
        {t.demo.hint}
      </p>
    </section>
  );
}
