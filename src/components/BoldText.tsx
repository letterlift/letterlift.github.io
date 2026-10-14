import { memo, useMemo } from 'react';
import { bolden } from '../core';

type Props = { text: string; strength?: number; enabled?: boolean };

export const BoldText = memo(function BoldText({
  text,
  strength,
  enabled = true,
}: Props) {
  const segments = useMemo(
    () => (enabled ? bolden(text, { strength }) : null),
    [text, strength, enabled],
  );
  if (!segments) return <>{text}</>;
  return (
    <>
      {segments.map((s, i) => (s.bold ? <b key={i}>{s.text}</b> : s.text))}
    </>
  );
});
