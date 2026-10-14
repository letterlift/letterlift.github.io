import { useI18n } from '../i18n';
import { REPO_URL } from './About';
import styles from './Footer.module.css';

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className={styles.footer}>
      <p className={styles.made}>{t.footer.made}</p>
      <p className={styles.links}>
        <a href={REPO_URL} rel="noopener noreferrer">
          {t.footer.github}
        </a>
        <span>{t.footer.license}</span>
      </p>
    </footer>
  );
}
