import { DEFAULT_STRENGTH } from '../core';
import { useI18n } from '../i18n';
import { SURVEY_URL, ISSUES_URL, TIPPLY_URL, voteUrl } from '../links';
import { BoldText } from './BoldText';
import { ExternalLink } from './ExternalLink';
import styles from './About.module.css';

type Props = { onBack: () => void; onPrivacy: () => void };

export function About({ onBack, onPrivacy }: Props) {
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
        <h2>{a.whyTitle}</h2>
        <p>{a.why1}</p>
        <p>{a.why2}</p>
      </section>
      <section>
        <h2>{a.whatTitle}</h2>
        <p>
          <BoldText text={a.what} strength={DEFAULT_STRENGTH} enabled />
        </p>
        <p className={styles.caption}>{a.techCaption}</p>
      </section>
      <section>
        <h2>{a.researchTitle}</h2>
        <p>{a.research}</p>
      </section>
      <section>
        <h2>{a.privacyTitle}</h2>
        <p>{a.privacy}</p>
        <p>
          {a.privacyMore} <a
            className={styles.legal}
            href="#privacy"
            onClick={(e) => {
              e.preventDefault();
              onPrivacy();
            }}
          >
            {a.legalLink}
          </a>
        </p>
      </section>
      <section>
        <h2 className={styles.nextHead}>
          {a.nextTitle} <span className={styles.tag}>{a.nextTag}</span>
        </h2>
        <p className={styles.muted}>{a.nextIntro}</p>
        <ul className={styles.plans}>
          {a.nextNames.map((name, i) => (
            <li key={name} className={styles.plan}>
              <p className={styles.planText}>
                <strong>{name}</strong> <span className={styles.planDesc}>{a.nextDescs[i]}</span>
              </p>
              <ExternalLink href={voteUrl(`${a.nextVotePrefix}: ${name}`, a.nextVoteBody)} variant="outline">
                {a.nextCta}
                <span className={styles.srOnly}> ({name})</span>
              </ExternalLink>
            </li>
          ))}
        </ul>
        <p className={styles.muted}>
          {a.nextNoGithub} <ExternalLink href={SURVEY_URL}>{a.nextSurveyLink}</ExternalLink>.
        </p>
      </section>
      <section aria-labelledby="about-support">
        <h2 id="about-support">{a.supportTitle}</h2>
        <p>{a.support}</p>
        <div className={styles.actions}>
          <ExternalLink href={TIPPLY_URL} variant="button">
            {a.supportCta}
          </ExternalLink>
        </div>
        <p className={styles.muted}>{a.supportNote}</p>
      </section>
      <section>
        <h2>{a.authorTitle}</h2>
        <p>{a.author}</p>
        <p>{a.ideaPrompt}</p>
        <div className={styles.actions}>
          <ExternalLink href={ISSUES_URL} variant="button">
            {a.reportIssue}
          </ExternalLink>
          <ExternalLink href={SURVEY_URL} variant="button">
            {a.surveyCta}
          </ExternalLink>
        </div>
        <p className={styles.muted}>{a.surveyNote}</p>
        <p className={styles.muted}>{a.libs}</p>
      </section>
      <p>
        <a
          className={styles.legal}
          href="#privacy"
          onClick={(e) => {
            e.preventDefault();
            onPrivacy();
          }}
        >
          {a.legalLink}
        </a>
      </p>
    </article>
  );
}
