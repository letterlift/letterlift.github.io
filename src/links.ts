export const REPO_URL = 'https://github.com/drogazem-design/letterlift';
export const ISSUES_URL = 'https://github.com/drogazem-design/letterlift/issues/new';
export const SURVEY_URL = 'https://tally.so/r/KpQQ0V';
export const TALLY_PRIVACY_URL = 'https://tally.so/help/privacy-policy';
export const TIPPLY_URL = 'https://tipply.pl/@zem';
export const GITHUB_PRIVACY_URL =
  'https://docs.github.com/site-policy/privacy-policies/github-general-privacy-statement';

/** Prefilled GitHub issue used as a "vote" for a planned feature. */
export function voteUrl(title: string, body: string): string {
  return `${ISSUES_URL}?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
}
