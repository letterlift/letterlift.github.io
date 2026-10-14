import { useEffect, useRef, type RefObject } from 'react';
import styles from './ProgressBar.module.css';

type Props = { targetRef: RefObject<HTMLElement | null> };

/** Thin scroll-progress line. Decorative: screen readers get no constant updates. */
export function ProgressBar({ targetRef }: Props) {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const el = targetRef.current;
      const bar = barRef.current;
      if (!el || !bar) return;
      const rect = el.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      const p = scrollable > 0 ? Math.min(1, Math.max(0, -rect.top / scrollable)) : 0;
      bar.style.transform = `scaleX(${p})`;
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    // Content can change height without scrolling (font size, width, wrapping).
    const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(schedule);
    if (targetRef.current) ro?.observe(targetRef.current);
    return () => {
      ro?.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [targetRef]);

  return (
    <div className={styles.track} aria-hidden="true" data-no-print>
      <div ref={barRef} className={styles.bar} />
    </div>
  );
}
