import { useEffect, useRef, useState, type DragEvent } from 'react';
import { useI18n } from '../i18n';
import { IngestError, ingestFile, type Block, type IngestErrorCode } from '../ingest';
import styles from './DropZone.module.css';

type Props = { onBlocks: (blocks: Block[]) => void };

export function DropZone({ onBlocks }: Props) {
  const { t } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<IngestErrorCode | null>(null);
  // Id of the latest request. Bumped on unmount and on every new file, so a slow
  // result from an older file (or after leaving this tab) is ignored.
  const requestId = useRef(0);
  const dragDepth = useRef(0);

  useEffect(
    () => () => {
      requestId.current += 1;
    },
    [],
  );

  async function handleFile(file: File | undefined) {
    if (!file) return;
    const id = ++requestId.current;
    setError(null);
    setLoading(true);
    try {
      const blocks = await ingestFile(file);
      if (id !== requestId.current) return;
      onBlocks(blocks);
    } catch (e) {
      if (id !== requestId.current) return;
      setError(e instanceof IngestError ? e.code : 'read-failed');
      setLoading(false);
    }
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    dragDepth.current = 0;
    setDragging(false);
    void handleFile(e.dataTransfer.files[0]);
  }

  return (
    <div
      className={styles.zone}
      data-dragging={dragging || undefined}
      onDragEnter={(e) => {
        e.preventDefault();
        dragDepth.current += 1;
        setDragging(true);
      }}
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={() => {
        dragDepth.current = Math.max(0, dragDepth.current - 1);
        if (dragDepth.current === 0) setDragging(false);
      }}
      onDrop={onDrop}
    >
      <input
        ref={inputRef}
        className={styles.input}
        type="file"
        accept=".txt,.md,.docx,.pdf"
        aria-label={t.drop.label}
        tabIndex={-1}
        data-testid="file-input"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          void handleFile(file);
        }}
      />

      <button
        type="button"
        className={styles.pick}
        aria-disabled={loading || undefined}
        onClick={() => {
          if (!loading) inputRef.current?.click();
        }}
      >
        {loading ? (
          <span className={styles.busy}>
            <span className={styles.spinner} aria-hidden="true" />
            {t.drop.loading}
          </span>
        ) : (
          <>
            <svg
              className={styles.icon}
              viewBox="0 0 48 48"
              width="48"
              height="48"
              aria-hidden="true"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 6h17l9 9v27H12z" />
              <path d="M29 6v9h9" />
              <path d="M24 35V22M18 27l6-6 6 6" />
            </svg>
            <span className={styles.prompt}>
              {dragging ? t.drop.dragging : t.drop.prompt}
            </span>
            <span className={styles.or}>{t.drop.or}</span>
          </>
        )}
      </button>

      <div className={styles.srOnly} role="status" aria-live="polite">
        {loading ? t.drop.loading : ''}
      </div>

      <p className={styles.formats}>{t.drop.formats}</p>

      <div className={styles.errorSlot} role="alert">
        {error && <p className={styles.error}>{t.drop.errors[error]}</p>}
      </div>
    </div>
  );
}
