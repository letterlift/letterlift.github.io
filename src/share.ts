/**
 * Android's share sheet opens the app with ?title=&text=&url=.
 * Combine them into one plain text, or null when nothing useful was shared.
 */
export function readSharedText(search: string): string | null {
  const params = new URLSearchParams(search)
  const title = (params.get('title') ?? '').trim()
  const text = (params.get('text') ?? '').trim()
  const url = (params.get('url') ?? '').trim()

  const parts: string[] = []
  if (title) parts.push(title)
  if (text) parts.push(text)
  // Android often puts the link inside text already; don't repeat it.
  if (url && !text.includes(url)) parts.push(url)

  return parts.length ? parts.join('\n\n') : null
}
