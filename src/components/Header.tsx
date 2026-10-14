import { useI18n, type Lang } from '../i18n';
import styles from './Header.module.css';

type Props = {
  current: 'home' | 'reader' | 'about';
  onHome: () => void;
  onAbout: () => void;
};

const LANGS: Lang[] = ['pl', 'en'];

export function Header({ current, onHome, onAbout }: Props) {
  const { t, lang, setLang } = useI18n();

  return (
    <header className={styles.header}>
      <a
        className={styles.wordmark}
        href="./"
        aria-label={t.nav.home}
        onClick={(e) => {
          e.preventDefault();
          onHome();
        }}
      >
        <b>Let</b>ter<b>Li</b>ft
      </a>
      <nav className={styles.nav} aria-label={t.nav.main}>
        <a
          className={styles.link}
          href="#about"
          aria-current={current === 'about' ? 'page' : undefined}
          onClick={(e) => {
            e.preventDefault();
            onAbout();
          }}
        >
          {t.nav.about}
        </a>
        <div className={styles.lang} role="group" aria-label={t.nav.langGroup}>
          {LANGS.map((l) => (
            <button
              key={l}
              type="button"
              lang={l}
              className={styles.langBtn}
              aria-pressed={lang === l}
              aria-label={t.nav[l]}
              onClick={() => setLang(l)}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </nav>
    </header>
  );
}
