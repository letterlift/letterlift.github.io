import { useEffect, useRef, type RefObject } from 'react';
import styles from './ReadingRuler.module.css';

type Props = {
  enabled: boolean;
  /** Band height in px (about 1.6 x the line height). */
  height: number;
  /** Area the pointer is tracked over. */
  targetRef: RefObject<HTMLElement | null>;
};

/** Soft highlighted band that follows the pointer or touch Y position. */
export function ReadingRuler({ enabled, height, targetRef }: Props) {
  const bandRef = useRef<HTMLDivElement>(null);
  const lastY = useRef<number | null>(null);

  useEffect(() => {
    const target = targetRef.current;
    const band = bandRef.current;
    if (!enabled || !target || !band) return;

    const place = (clientY: number) => {
      lastY.current = clientY;
      band.style.transform = `translateY(${Math.round(clientY - height / 2)}px)`;
    };
    // Start visible, a little above the middle, so people see what it is straight away.
    place(lastY.current ?? window.innerHeight * 0.4);

    const onPointer = (e: PointerEvent) => place(e.clientY);
    const onTouch = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch) place(touch.clientY);
    };
    target.addEventListener('pointermove', onPointer, { passive: true });
    target.addEventListener('pointerdown', onPointer, { passive: true });
    target.addEventListener('touchstart', onTouch, { passive: true });
    target.addEventListener('touchmove', onTouch, { passive: true });
    return () => {
      target.removeEventListener('pointermove', onPointer);
      target.removeEventListener('pointerdown', onPointer);
      target.removeEventListener('touchstart', onTouch);
      target.removeEventListener('touchmove', onTouch);
    };
  }, [enabled, height, targetRef]);

  if (!enabled) return null;
  return (
    <div
      ref={bandRef}
      className={styles.band}
      style={{ height }}
      aria-hidden="true"
      data-testid="reading-ruler"
      data-no-print
    />
  );
}
