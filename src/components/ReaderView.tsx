import type { CSSProperties } from 'react';
import type { Block } from '../ingest/types';
import type { FontChoice, ReaderSettings } from '../settings/settings';
import { BoldText } from './BoldText';
import styles from './ReaderView.module.css';

const FONT_STACKS: Record<FontChoice, string> = {
  atkinson: 'var(--font-body)',
  system:
    "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  serif: "Georgia, 'Times New Roman', serif",
};

type Props = { blocks: Block[]; settings: ReaderSettings };

type Group =
  | { kind: 'single'; block: Block; index: number }
  | { kind: 'list'; items: { block: Block; index: number }[] };

function group(blocks: Block[]): Group[] {
  const groups: Group[] = [];
  blocks.forEach((block, index) => {
    const last = groups[groups.length - 1];
    if (block.type === 'list-item') {
      if (last?.kind === 'list') last.items.push({ block, index });
      else groups.push({ kind: 'list', items: [{ block, index }] });
    } else {
      groups.push({ kind: 'single', block, index });
    }
  });
  return groups;
}

export function ReaderView({ blocks, settings }: Props) {
  const style = {
    '--reader-size': `${settings.fontSize}px`,
    '--reader-leading': String(settings.lineHeight),
    '--reader-measure': `${settings.maxWidth}ch`,
    '--reader-tracking': `${settings.letterSpacing}em`,
    '--reader-font': FONT_STACKS[settings.font],
  } as CSSProperties;

  const bold = (text: string) => (
    <BoldText
      text={text}
      strength={settings.strength}
      enabled={settings.boldEnabled}
    />
  );

  return (
    <article className={styles.reader} style={style}>
      {group(blocks).map((g) => {
        if (g.kind === 'list') {
          return (
            <ul key={`l${g.items[0].index}`}>
              {g.items.map(({ block, index }) => (
                <li key={index} data-block-index={index}>
                  {bold(block.text)}
                </li>
              ))}
            </ul>
          );
        }
        const { block, index } = g;
        return block.type === 'heading' ? (
          <h2 key={index} data-block-index={index}>
            {bold(block.text)}
          </h2>
        ) : (
          <p key={index} data-block-index={index}>
            {bold(block.text)}
          </p>
        );
      })}
    </article>
  );
}
