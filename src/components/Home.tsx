import { useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { useI18n } from '../i18n';
import { parsePlainText, type Block } from '../ingest';
import { BoldText } from './BoldText';
import { DropZone } from './DropZone';
import { HeroDemo } from './HeroDemo';
import { MobileHowTo } from './MobileHowTo';
import styles from './Home.module.css';

type Props = {
  onOpen: (blocks: Block[]) => void;
  /** Pasted text lives in App so it survives visiting other screens. */
  text: string;
  onTextChange: (text: string) => void;
};
type Tab = 'paste' | 'upload';
const TABS: Tab[] = ['paste', 'upload'];

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      className={styles.tileIcon}
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
      {children}
    </svg>
  );
}

export function Home({ onOpen, text, onTextChange }: Props) {
  const { t } = useI18n();
  const [tab, setTab] = useState<Tab>('paste');
  const tabRefs = useRef<Record<Tab, HTMLButtonElement | null>>({ paste: null, upload: null });

  const canRead = text.trim().length > 0;

  function submit() {
    if (!canRead) return;
    const blocks = parsePlainText(text);
    if (blocks.length > 0) onOpen(blocks);
  }

  function onTabKey(e: KeyboardEvent) {
    const i = TABS.indexOf(tab);
    let next: Tab | null = null;
    if (e.key === 'ArrowRight') next = TABS[(i + 1) % TABS.length];
    else if (e.key === 'ArrowLeft') next = TABS[(i - 1 + TABS.length) % TABS.length];
    else if (e.key === 'Home') next = TABS[0];
    else if (e.key === 'End') next = TABS[TABS.length - 1];
    if (next) {
      e.preventDefault();
      setTab(next);
      tabRefs.current[next]?.focus();
    }
  }

  const tiles = [
    {
      key: 'privacy',
      ...t.tiles.privacy,
      icon: (
        <>
          <rect x="6" y="14" width="20" height="14" rx="3" />
          <path d="M11 14v-3a5 5 0 0 1 10 0v3" />
        </>
      ),
    },
    {
      key: 'free',
      ...t.tiles.free,
      icon: (
        <>
          <path d="M11 9l-7 7 7 7M21 9l7 7-7 7" />
          <path d="M18 7l-4 18" />
        </>
      ),
    },
    {
      key: 'adjust',
      ...t.tiles.adjust,
      icon: (
        <>
          <path d="M5 10h22M5 22h22" />
          <circle cx="11" cy="10" r="3" fill="var(--bg)" />
          <circle cx="21" cy="22" r="3" fill="var(--bg)" />
        </>
      ),
    },
  ];

  return (
    <div className={styles.home}>
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <h1 className={styles.headline}>
            <BoldText text={t.hero.headline} strength={0.45} />
          </h1>
          <p className={styles.sub}>{t.hero.sub}</p>
          <p className={styles.privacy}>
            <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="9" width="12" height="8" rx="2" />
              <path d="M7 9V7a3 3 0 0 1 6 0v2" />
            </svg>
            {t.hero.privacy}
          </p>
        </div>
        <div className={styles.heroDemo}>
          <HeroDemo />
        </div>
      </section>

      <section className={styles.input} aria-labelledby="input-heading">
        <h2 id="input-heading" className={styles.inputHeading}>
          {t.input.heading}
        </h2>

        <div className={styles.tabs} role="tablist" aria-label={t.input.tablist} onKeyDown={onTabKey}>
          {TABS.map((id) => (
            <button
              key={id}
              ref={(el) => {
                tabRefs.current[id] = el;
              }}
              id={`tab-${id}`}
              type="button"
              role="tab"
              aria-selected={tab === id}
              aria-controls={tab === id ? `panel-${id}` : undefined}
              tabIndex={tab === id ? 0 : -1}
              className={styles.tab}
              onClick={() => setTab(id)}
            >
              {id === 'paste' ? t.input.tabPaste : t.input.tabUpload}
            </button>
          ))}
        </div>

        {tab === 'paste' ? (
          <div role="tabpanel" id="panel-paste" aria-labelledby="tab-paste" className={styles.panel}>
            <label htmlFor="paste-text" className={styles.srOnly}>
              {t.input.textareaLabel}
            </label>
            <textarea
              id="paste-text"
              className={styles.textarea}
              value={text}
              placeholder={t.input.placeholder}
              onChange={(e) => onTextChange(e.target.value)}
              rows={8}
            />
            <div className={styles.pasteFooter}>
              <span className={styles.counter} aria-live="off">
                {t.input.counter(text.length)}
              </span>
              <button type="button" className={styles.read} disabled={!canRead} onClick={submit}>
                {t.input.read}
              </button>
            </div>
          </div>
        ) : (
          <div role="tabpanel" id="panel-upload" aria-labelledby="tab-upload" className={styles.panel}>
            <DropZone onBlocks={onOpen} />
          </div>
        )}
      </section>

      <section className={styles.tiles} aria-labelledby="tiles-heading">
        <h2 id="tiles-heading" className={styles.tilesHeading}>
          {t.tiles.heading}
        </h2>
        <ul className={styles.tileList}>
          {tiles.map((tile) => (
            <li key={tile.key} className={styles.tile}>
              <Icon>{tile.icon}</Icon>
              <h3 className={styles.tileTitle}>{tile.title}</h3>
              <p className={styles.tileBody}>{tile.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <MobileHowTo />
    </div>
  );
}
