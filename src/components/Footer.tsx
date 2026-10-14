import { useI18n } from '../i18n';
import { REPO_URL } from '../links';
import styles from './Footer.module.css';

type Props = { onPrivacy: () => void };

export function Footer({ onPrivacy }: Props) {
  const { t } = useI18n();
  return (
    <footer className={styles.footer}>
      <p className={styles.made}>{t.footer.made}</p>
      <p className={styles.links}>
        <a href={REPO_URL} rel="noopener noreferrer">
          {t.footer.github}
        </a>
        <a
          href="#privacy"
          onClick={(e) => {
            e.preventDefault();
            onPrivacy();
          }}
        >
          {t.footer.privacy}
        </a>
        <span>{t.footer.license}</span>
      </p>
    </footer>
  );
}
