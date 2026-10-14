import { useI18n } from '../i18n';
import styles from './About.module.css';

type Props = { onBack: () => void };

export const REPO_URL = 'https://github.com/drogazem-design/letterlift';

export function About({ onBack }: Props) {
  const { t } = useI18n();
  const a = t.about;

  return (
    <article className={styles.about}>
      <button type="button" className={styles.back} onClick={onBack}>
        {a.back}
      </button>
      <h1 className={styles.title}>{a.title}</h1>
      <p className={styles.lead}>{a.lead}</p>

      <section>
        <h2>{a.whatTitle}</h2>
        <p>{a.what}</p>
      </section>
      <section>
        <h2>{a.researchTitle}</h2>
        <p>{a.research}</p>
      </section>
      <section>
        <h2>{a.tipsTitle}</h2>
        <ul>
          {a.tips.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </section>
      <section>
        <h2>{a.privacyTitle}</h2>
        <p>{a.privacy}</p>
      </section>
      <section>
        <h2>{a.creditsTitle}</h2>
        <p>{a.author}</p>
        <p>{a.credits}</p>
        <p>
          <a href={REPO_URL} rel="noopener noreferrer">
            {a.source}
          </a>
        </p>
      </section>
    </article>
  );
}
