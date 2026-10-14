import type { ReactNode } from 'react';
import { useI18n } from '../i18n';
import styles from './ExternalLink.module.css';

type Props = { href: string; children: ReactNode; variant?: 'button' | 'inline' | 'outline' };

/** Link to another site: opens in a new tab and says so to screen readers. */
export function ExternalLink({ href, children, variant = 'inline' }: Props) {
  const { t } = useI18n();
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={styles[variant]}
    >
      {children}
      <svg className={styles.icon} viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">
        <path
          d="M9 2h5v5M14 2 7.5 8.5M12 9v4a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className={styles.hidden}> {t.about.newTab}</span>
    </a>
  );
}
