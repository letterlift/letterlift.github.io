import { useI18n } from '../i18n';
import { IOS_SHORTCUT_URL } from '../links';
import { ExternalLink } from './ExternalLink';
import styles from './MobileHowTo.module.css';

type Props = {
  /** iCloud link to the Apple Shortcut. Empty shows the Add to Home Screen fallback. */
  shortcutUrl?: string;
};

function PhoneIcon() {
  return (
    <svg
      className={styles.icon}
      viewBox="0 0 32 32"
      width="32"
      height="32"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="4" width="14" height="24" rx="3" />
      <path d="M14 24h4" />
    </svg>
  );
}

export function MobileHowTo({ shortcutUrl = IOS_SHORTCUT_URL }: Props) {
  const { t } = useI18n();
  const m = t.mobile;
  const hasShortcut = shortcutUrl !== '';

  return (
    <section className={styles.section} aria-labelledby="mobile-heading">
      <h2 id="mobile-heading" className={styles.heading}>
        {m.heading}
      </h2>
      <p className={styles.intro}>{m.intro}</p>
      <div className={styles.cards}>
        <div className={styles.card}>
          <PhoneIcon />
          <h3 className={styles.title}>{m.android.title}</h3>
          <ol className={styles.steps}>
            {m.android.steps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
          <p className={styles.note}>{m.android.note}</p>
        </div>
        <div className={styles.card}>
          <PhoneIcon />
          <h3 className={styles.title}>{m.ios.title}</h3>
          <ol className={styles.steps}>
            {(hasShortcut ? m.ios.shortcutSteps : m.ios.fallbackSteps).map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
          {hasShortcut && (
            <>
              <div>
                <ExternalLink href={shortcutUrl} variant="button">
                  {m.ios.addShortcut}
                </ExternalLink>
              </div>
              <p className={styles.note}>{m.ios.shortcutNote}</p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
