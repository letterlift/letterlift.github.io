import { useI18n } from '../i18n';
import { SURVEY_URL, GITHUB_PRIVACY_URL, ISSUES_URL, REPO_URL, TALLY_PRIVACY_URL } from '../links';
import { ExternalLink } from './ExternalLink';
import styles from './Privacy.module.css';

type Props = { onBack: () => void };

export function Privacy({ onBack }: Props) {
  const { t } = useI18n();
  const l = t.legal;

  return (
    <article className={styles.page}>
      <button type="button" className={styles.back} onClick={onBack}>
        {l.back}
      </button>
      <header className={styles.head}>
        <h1 className={styles.title}>{l.title}</h1>
        <p className={styles.date}>{l.effective}</p>
      </header>

      <section className={styles.card} aria-labelledby="legal-who">
        <h2 id="legal-who">{l.whoTitle}</h2>
        <p>{l.who}</p>
        <div className={styles.actions}>
          <ExternalLink href={ISSUES_URL}>{t.about.reportIssue}</ExternalLink>
          <ExternalLink href={SURVEY_URL}>{l.contactSurvey}</ExternalLink>
        </div>
      </section>

      <section className={`${styles.card} ${styles.notice}`} aria-labelledby="legal-medical">
        <h2 id="legal-medical">{l.medicalTitle}</h2>
        <p>{l.medical}</p>
      </section>

      <section className={styles.card} aria-labelledby="legal-privacy">
        <h2 id="legal-privacy">{l.privacyTitle}</h2>
        <ul>
          {l.privacyItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
          <li>
            {l.hosting} <ExternalLink href={GITHUB_PRIVACY_URL}>{l.hostingLink}</ExternalLink>
          </li>
          <li>
            {l.tally} <ExternalLink href={TALLY_PRIVACY_URL}>{l.tallyLink}</ExternalLink>
          </li>
          <li>{l.external}</li>
          <li>{l.tipply}</li>
        </ul>
      </section>

      <section className={styles.card} aria-labelledby="legal-terms">
        <h2 id="legal-terms">{l.termsTitle}</h2>
        <ul>
          {l.terms.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className={styles.card} aria-labelledby="legal-license">
        <h2 id="legal-license">{l.licenseTitle}</h2>
        <p>{l.license}</p>
        <p>
          <ExternalLink href={REPO_URL}>{l.repo}</ExternalLink>
        </p>
      </section>
    </article>
  );
}
