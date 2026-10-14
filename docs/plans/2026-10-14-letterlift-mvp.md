# LetterLift v1 — implementation plan (full product)

Spec: `PLAN.md` (repo root) + this file. This file is the binding detail.

Goal: a free, privacy-first web app (PWA) that turns pasted text or an uploaded
TXT/DOCX/PDF into an easier-to-follow reading view by bolding the beginning of
each word. Released for ADHD Awareness Month, October 2026. Must feel warm,
polished and delightful — not a dev tool.

## Global Constraints

- **Stack:** Vite + React 19 + TypeScript (strict) + Vitest + jsdom + @testing-library/react. Plain CSS (CSS custom properties, CSS modules allowed: `*.module.css`). No UI framework, no Tailwind, no router library.
- **No backend, no network calls at runtime** except loading the app's own static assets. No analytics, no AI, no external fonts CDN — fonts are self-hosted via `@fontsource*` packages. User text never leaves the device.
- **Single app, not a monorepo.** Layout:
  ```
  src/core/      bolden logic (pure TS, no DOM, no React)
  src/ingest/    file → Block[] adapters
  src/settings/  ReaderSettings type, defaults, persistence
  src/i18n/      pl/en dictionaries + hook
  src/components/ React components
  src/styles/    tokens.css, global.css
  ```
- **Vite `base`:** `/letterlift/` (GitHub Pages at https://drogazem-design.github.io/letterlift/). All asset/manifest paths must work under that base.
- **Naming:** product is "LetterLift". Never use the words "Bionic Reading" or "Easy Read" anywhere in UI or code.
- **Honesty:** UI copy never claims it makes you read faster or improves comprehension. Tone: "Some people find this easier to follow. Try it and see what works for your brain."
- **Languages:** UI in Polish (default when `navigator.language` starts with `pl`) and English (otherwise), switchable. All user-visible strings go through `src/i18n`.
- **Accessibility:** WCAG 2.2 AA contrast in all themes; everything keyboard-operable with visible focus rings; respects `prefers-reduced-motion` (no non-essential animation when set); semantic HTML; form controls have labels.
- **Storage:** `localStorage` only for settings and UI prefs; every access wrapped in try/catch; app works fully when storage throws.
- **Tests:** `npm test` runs `vitest run`. Output must be pristine (no warnings). `npm run build` must succeed with zero TS errors.
- **Commits:** small, conventional messages (`feat:`, `test:`, `chore:`), each ending with the line `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`. Never push.

### Design direction (binding for every UI task)

The brand idea: **letters that lift you up** — warm, encouraging, a little playful, calm enough for a distracted brain. Avoid generic "AI SaaS" look (no purple gradients, no glassmorphism, no stock hero blobs, no emoji as icons).

- **Palette (tokens in `src/styles/tokens.css`):**
  - Light ("paper"): `--bg #FBF7F0`, `--surface #FFFFFF`, `--ink #1F1B16`, `--ink-soft #5B5248`, `--line #E7DFD3`, `--accent #FF6B4A` (warm coral), `--accent-ink #FFFFFF`, `--highlight #FFE27A` (marker yellow), `--focus #2B59FF`.
  - Dark ("night"): `--bg #17150F`, `--surface #221F18`, `--ink #F3ECE0`, `--ink-soft #B8AD9C`, `--line #3A352B`, `--accent #FF8A6E`, `--accent-ink #17150F`, `--highlight #6B5A12`, `--focus #8AA6FF`.
  - Sepia (reader only): `--bg #F4ECD8`, `--surface #FAF4E4`, `--ink #3B2F1E`, `--ink-soft #6E5D45`, `--line #E2D5B8`.
  - Theme is applied with `data-theme="light|dark|sepia"` on `<html>`; `system` follows `prefers-color-scheme`.
- **Type:** display/headings `Bricolage Grotesque` (`@fontsource-variable/bricolage-grotesque`); body and reading text `Atkinson Hyperlegible` (`@fontsource/atkinson-hyperlegible`, weights 400 + 700). Reader also offers "system" and "serif" (Georgia stack).
- **Shape & space:** radius 14px cards / 999px pills; generous whitespace; 8px spacing scale; soft single shadow `0 1px 0 var(--line), 0 8px 24px -12px rgb(0 0 0 / .18)`.
- **Signature motif:** the wordmark is itself bolded the LetterLift way: **Let**ter**Li**ft. Bold fragments may get a subtle marker-yellow underline swash on the landing page hero only.
- **Motion:** small and purposeful (150–250ms ease-out); the hero demo animates bolding in word by word once on load (disabled under reduced motion).
- **Microcopy:** short, kind, second person, never patronising. Errors say what happened and what to do next.
- **Mobile-first:** works at 360px width, 16px side gutters, no horizontal scroll, tap targets ≥ 44px.

---

### Task 1: Project scaffold, design tokens, fonts

**Files:** `package.json`, `tsconfig.json` (+ `tsconfig.node.json` if needed), `vite.config.ts`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/styles/tokens.css`, `src/styles/global.css`, `src/test/setup.ts`, `src/App.test.tsx`.

Do NOT run `npm create vite` (directory is non-empty). Create files by hand and `npm install` latest stable versions of: `react`, `react-dom`; dev: `vite`, `@vitejs/plugin-react`, `typescript`, `@types/react`, `@types/react-dom`, `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`. Runtime: `@fontsource/atkinson-hyperlegible`, `@fontsource-variable/bricolage-grotesque`.

Requirements:
1. Scripts: `dev` = `vite`, `build` = `tsc -b && vite build`, `preview` = `vite preview`, `test` = `vitest run`, `test:watch` = `vitest`.
2. `vite.config.ts`: `base: '/letterlift/'`, React plugin, Vitest config (`environment: 'jsdom'`, `setupFiles: ['src/test/setup.ts']`, `globals: false`). `setup.ts` imports `@testing-library/jest-dom/vitest`.
3. `tokens.css` defines every token from Design direction for `light`, `dark`, `sepia` via `:root[data-theme=...]`, plus `:root` defaulting to light and a `@media (prefers-color-scheme: dark)` block applying dark tokens to `:root:not([data-theme])`. Also spacing scale `--space-1..8` (4,8,12,16,24,32,48,64px), radii, shadow, font-family tokens `--font-display`, `--font-body`.
4. `global.css`: modern reset, `body { background: var(--bg); color: var(--ink); font-family: var(--font-body); }`, visible `:focus-visible` outline using `--focus`, `@media (prefers-reduced-motion: reduce)` disabling transitions/animations.
5. `index.html`: `lang="pl"`, title `LetterLift`, meta description, viewport, `theme-color` `#FBF7F0`.
6. `App.tsx`: placeholder rendering the wordmark `<h1>` with "LetterLift" (structure `<b>Let</b>ter<b>Li</b>ft`, accessible name "LetterLift" via `aria-label`).
7. `App.test.tsx`: renders App and asserts heading with accessible name "LetterLift".
8. `.gitignore` already exists — keep it.

Acceptance: `npm test` passes pristine; `npm run build` succeeds.

### Task 2: Core bolding algorithm

**Files:** `src/core/bolden.ts`, `src/core/bolden.test.ts`, `src/core/index.ts` (re-exports).

TDD required.

```ts
export type Segment = { text: string; bold: boolean };
export type BoldenOptions = { strength?: number; locale?: string };
export const DEFAULT_STRENGTH = 0.45;
export function bolden(text: string, options?: BoldenOptions): Segment[];
```

Rules:
1. Split with `new Intl.Segmenter(locale, { granularity: 'word' })` (locale default `undefined`). Cache segmenters per locale.
2. Only segments with `isWordLike === true` **and** containing at least one Unicode letter (`/\p{L}/u`) are bolded. Pure numbers and punctuation/whitespace pass through non-bold.
3. Word length = number of code points (`Array.from(word).length`). Bold count `n = clamp(Math.round(len * strength), 1, len)`.
4. `strength` is clamped to `[0.1, 0.9]`; default `DEFAULT_STRENGTH`.
5. Adjacent segments with equal `bold` are merged. Empty input returns `[]`. Concatenating all `text` always equals the input exactly.

Required test cases (default strength unless stated):
- `bolden('')` → `[]`
- `bolden('a')` → `[{text:'a',bold:true}]`
- `bolden('people')` → `[{text:'peo',bold:true},{text:'ple',bold:false}]`
- `bolden('Attention')` → `[{text:'Atte',bold:true},{text:'ntion',bold:false}]`
- `bolden('Zażółć')` → `[{text:'Zaż',bold:true},{text:'ółć',bold:false}]`
- `bolden('Hello, world!')` → `[{text:'He',bold:true},{text:'llo, ',bold:false},{text:'wo',bold:true},{text:'rld!',bold:false}]`
- `bolden('123 go')` → `[{text:'123 ',bold:false},{text:'g',bold:true},{text:'o',bold:false}]`
- `bolden('people', {strength: 5})` → strength clamped to 0.9 → `[{text:'peopl',bold:true},{text:'e',bold:false}]`
- `bolden('people', {strength: 0})` → clamped to 0.1 → `[{text:'p',bold:true},{text:'eople',bold:false}]`
- Round-trip property: for a multi-line Polish + English sample with newlines, tabs and emoji, `segments.map(s=>s.text).join('') === input`.

### Task 3: Document ingestion (paste, TXT, DOCX, PDF)

**Files:** `src/ingest/types.ts`, `src/ingest/plainText.ts`, `src/ingest/html.ts`, `src/ingest/docx.ts`, `src/ingest/pdf.ts`, `src/ingest/index.ts`, tests `src/ingest/plainText.test.ts`, `src/ingest/html.test.ts`, `src/ingest/index.test.ts`.

Install: `mammoth`, `pdfjs-dist`.

```ts
export type BlockType = 'heading' | 'paragraph' | 'list-item';
export type Block = { type: BlockType; text: string };
export type IngestErrorCode = 'unsupported' | 'too-large' | 'empty' | 'no-text-in-pdf' | 'read-failed';
export class IngestError extends Error { constructor(public code: IngestErrorCode, message?: string) }
export const MAX_FILE_BYTES = 20 * 1024 * 1024;
export function parsePlainText(text: string): Block[];
export function htmlToBlocks(html: string): Block[];
export function ingestFile(file: File): Promise<Block[]>;
```

`parsePlainText` rules (TDD):
1. Normalize `\r\n` → `\n`. Split into chunks on blank lines (`/\n\s*\n/`).
2. A line starting with `# `–`###### ` → `heading` (marker stripped).
3. A line starting with `- `, `* `, `• `, or `\d+[.)] ` → `list-item` (marker stripped); each such line is its own block.
4. Other consecutive lines in a chunk are joined into one `paragraph`: a line ending in `<letter>-` followed by a line starting with a lowercase letter is joined without the hyphen (`przy-\nkład` → `przykład`); otherwise joined with a single space.
5. Collapse runs of spaces/tabs to one space; trim; drop empty blocks.

`htmlToBlocks` (uses `DOMParser`): `h1–h6` → heading, `li` → list-item, `p`, `blockquote` → paragraph, using `textContent` with whitespace collapsed; skip empty; ignore `script`/`style`. Plain text nodes directly in `body` become paragraphs.

`ingestFile`:
- Size > `MAX_FILE_BYTES` → `IngestError('too-large')`.
- By extension (case-insensitive) or MIME: `.txt`/`.md`/`text/plain` → `parsePlainText(await file.text())`; `.docx` → `mammoth.convertToHtml({arrayBuffer})` → `htmlToBlocks` (`docx.ts`, loaded with dynamic `import()` so it's code-split); `.pdf` → `pdf.ts` via dynamic import: `pdfjs-dist` with worker configured through `import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'`; per page `getTextContent()`, join items, `hasEOL` → `\n`, pages joined with `\n\n`, then `parsePlainText`. If a PDF yields no letters → `IngestError('no-text-in-pdf')`.
- Anything else → `IngestError('unsupported')`. Result with zero blocks → `IngestError('empty')`. Library exceptions → `IngestError('read-failed')`.

Tests: thorough `parsePlainText` and `htmlToBlocks` unit tests; `index.test.ts` covers too-large, unsupported, empty TXT and a successful TXT `File`. PDF/DOCX adapters are not unit-tested (library-bound) but must type-check and build.

### Task 4: Settings model and BoldText / Reader rendering

**Files:** `src/settings/settings.ts`, `src/settings/useSettings.ts`, `src/settings/settings.test.ts`, `src/components/BoldText.tsx`, `src/components/ReaderView.tsx`, `src/components/ReaderView.module.css`, `src/components/ReaderView.test.tsx`.

```ts
export type Theme = 'system' | 'light' | 'dark' | 'sepia';
export type FontChoice = 'atkinson' | 'system' | 'serif';
export type ReaderSettings = {
  boldEnabled: boolean;   // default true
  strength: number;       // default 0.45, range 0.2–0.7, step 0.05
  fontSize: number;       // px, default 20, range 16–32, step 1
  lineHeight: number;     // default 1.7, range 1.4–2.2, step 0.1
  maxWidth: number;       // ch, default 62, range 40–90, step 2
  letterSpacing: number;  // em, default 0.01, range 0–0.12, step 0.01
  theme: Theme;           // default 'system'
  font: FontChoice;       // default 'atkinson'
};
export const DEFAULT_SETTINGS: ReaderSettings;
export const SETTINGS_KEY = 'letterlift:settings:v1';
export function loadSettings(storage?: Storage): ReaderSettings;   // merges stored over defaults, clamps every numeric field, ignores invalid enums/JSON, never throws
export function saveSettings(s: ReaderSettings, storage?: Storage): void; // never throws
export function useSettings(): [ReaderSettings, (patch: Partial<ReaderSettings>) => void, () => void /* reset */];
```
`useSettings` also applies `data-theme` on `document.documentElement` (removes the attribute for `system`).

`BoldText({ text, strength, enabled })`: renders `bolden()` segments; bold ones as `<b>`, others as text; memoized; when `enabled` is false renders plain text.

`ReaderView({ blocks, settings })`: renders `heading` → `<h2>`, `paragraph` → `<p>`, consecutive `list-item`s → one `<ul>` with `<li>`s, inside `<article>` whose CSS variables come from settings (`--reader-size`, `--reader-leading`, `--reader-measure`, `--reader-tracking`, `--reader-font`). Reader text uses `font-weight: 400` with `<b>` at 700. Each block gets `data-block-index`.

Tests: `loadSettings` with valid/invalid/throwing storage and clamping; `ReaderView` renders headings/paragraphs/grouped lists, renders `<b>` when enabled and none when disabled.

### Task 5: App shell, i18n and Home screen (paste / upload / live demo)

**Load the `frontend-design:frontend-design` skill before writing UI.** Follow Design direction exactly.

**Files:** `src/i18n/pl.ts`, `src/i18n/en.ts`, `src/i18n/index.ts` (dictionary type derived from `pl`, `useI18n()` returning `{ t, lang, setLang }`, persisted under `letterlift:lang`), `src/App.tsx`, `src/components/Header.tsx`, `src/components/Home.tsx`, `src/components/HeroDemo.tsx`, `src/components/DropZone.tsx`, `src/components/About.tsx`, matching `*.module.css`, tests `src/components/Home.test.tsx`, `src/i18n/i18n.test.ts`.

App state (no router): `screen: 'home' | 'reader' | 'about'`, `doc: { title: string; blocks: Block[] } | null`. `#about` hash opens About; browser back works between screens via `history.pushState`/`popstate`.

Header: wordmark (**Let**ter**Li**ft, links home), language switch (PL/EN pill), link "O projekcie"/"About".

Home, top to bottom:
1. Hero: headline PL "Czytaj tak, jak lubi Twój mózg." / EN "Read the way your brain likes it."; sub-line explaining in one sentence what it does + privacy line "Twój tekst nie opuszcza Twojego urządzenia." / "Your text never leaves your device."
2. `HeroDemo`: a card with a sample sentence (PL or EN per language) rendered with `BoldText`, an inline strength slider and a "bold on/off" toggle so people *feel* the difference instantly. Words animate in bolding once on mount (respect reduced motion).
3. Input card with two tabs: "Wklej tekst"/"Paste text" (large textarea, placeholder with an example, character counter, button "Czytaj"/"Read" disabled when empty) and "Wgraj plik"/"Upload a file" (`DropZone`: drag & drop + click-to-pick, accepts `.txt,.md,.docx,.pdf`, shows supported formats and the 20 MB limit, loading state with a friendly spinner, error states mapped from every `IngestErrorCode` to a kind, actionable message).
4. Three small "how it helps" tiles (privacy, free & open source, adjustable to you) — honest copy per Global Constraints.
5. Footer: "Zrobione z ❤️ na Miesiąc Świadomości ADHD 2026" / "Made with ❤️ for ADHD Awareness Month 2026", GitHub link https://github.com/drogazem-design/letterlift, MIT.

Successful paste → `parsePlainText`; successful upload → `ingestFile`; both open the reader with `doc.title` = first heading or first ~6 words.

About screen: what the technique is, honest note that research is mixed and it helps some people, other tips (larger text, shorter sessions, audiobooks), privacy statement, credits.

Tests: language detection default; paste flow (type text → click Read → reader screen shows bolded text); Read button disabled when empty; DropZone shows the mapped error for an unsupported file.

### Task 6: Reader screen with comfort controls and focus tools

**Load the `frontend-design:frontend-design` skill before writing UI.** Follow Design direction exactly.

**Files:** `src/components/ReaderScreen.tsx`, `src/components/SettingsPanel.tsx`, `src/components/ReadingRuler.tsx`, `src/components/ProgressBar.tsx`, `src/core/readingTime.ts` (+ test), matching `*.module.css`, tests `src/components/ReaderScreen.test.tsx`.

1. Top bar (sticky, compact): back to home ("← Nowy tekst"/"← New text"), document title (truncated), estimated reading time, "Ustawienia"/"Settings" button, copy and print buttons.
2. `readingTime(blocks, wpm = 200): number` minutes, min 1 (TDD).
3. `SettingsPanel`: side sheet on ≥ 900px, bottom sheet on mobile; focus-trapped, closes on Esc and backdrop click, returns focus to the trigger. Controls (all labelled, live-updating the text behind): bold on/off, bold strength slider, font size, line spacing, line width, letter spacing, font (3 visual swatches), theme (system/light/dark/sepia as visual swatches), "Przywróć domyślne"/"Reset to defaults". Persists via `useSettings`.
4. Focus tools (toggle buttons in the panel, persisted in `localStorage` key `letterlift:focus:v1`):
   - **Reading ruler:** a soft `--highlight`-tinted horizontal band (height ≈ 1.6 × line height) following the pointer/touch Y position over the article; hidden when off.
   - **Paragraph focus:** dims all blocks except the one nearest the viewport centre (opacity .35), updated on scroll with `IntersectionObserver`/rAF throttling.
5. `ProgressBar`: thin bar at the top showing scroll progress through the article.
6. Copy button copies plain text; print button calls `window.print()` with a print stylesheet that keeps bold fragments and hides chrome.

Tests: reading time maths; settings panel opens, changing font size updates the article CSS variable, Esc closes and restores focus; paragraph-focus toggle adds a dimming class.

### Task 7: PWA + Android share target + icons

**Files:** install `vite-plugin-pwa` (+ `@vite-pwa/assets-generator` dev). `vite.config.ts`, `public/icon.svg`, generated PNG icons in `public/` (192, 512, maskable 512, apple-touch 180), `pwa-assets.config.ts`, `src/share.ts`, `src/share.test.ts`, wire into `App.tsx`.

1. Icon: SVG on `--accent` coral rounded square with a white bold "L" whose top-right has a small lifted/raised stroke; simple and legible at 48px. Generate PNGs with the assets generator (script `npm run icons`), commit generated files.
2. Manifest: name "LetterLift", short_name "LetterLift", description (EN), `start_url: '/letterlift/'`, `scope: '/letterlift/'`, `display: 'standalone'`, `background_color '#FBF7F0'`, `theme_color '#FF6B4A'`, icons, and
   ```json
   "share_target": { "action": "/letterlift/", "method": "GET", "params": { "title": "title", "text": "text", "url": "url" } }
   ```
3. Service worker: `registerType: 'autoUpdate'`, precache app shell incl. fonts and pdf worker so the app works offline.
4. `src/share.ts`: `readSharedText(search: string): string | null` combining `title`, `text`, `url` (skip empty, skip `url` if already contained in `text`, joined with blank lines); returns null when none present. On startup App calls it with `location.search`; if text exists → open reader with `parsePlainText` result, then `history.replaceState` to strip the query.
5. Tests for `readSharedText` (all combos, duplicates, empty, URL-encoded Polish characters).

Acceptance: `npm run build` emits `manifest.webmanifest` with share_target and a service worker.

### Task 8: GitHub Pages deployment + README

**Files:** `.github/workflows/deploy.yml`, `README.md`, `public/404.html` (optional redirect to `/letterlift/`).

1. Workflow on push to `main` and `workflow_dispatch`: checkout, setup-node (Node 22, npm cache), `npm ci`, `npm test`, `npm run build`, `actions/upload-pages-artifact` (path `dist`), `actions/deploy-pages`. Permissions `pages: write`, `id-token: write`, `contents: read`; concurrency group `pages`.
2. README (bilingual PL first, then EN): what it is, live link https://drogazem-design.github.io/letterlift/, privacy statement, honest note about the technique, how to install as an app on Android (Add to Home screen → then "Share → LetterLift" from SMS/Gmail), iPhone note (copy & paste; Share target not supported in Safari), local development commands, licence, credit line for ADHD Awareness Month 2026.
3. Do not include screenshots that contain third-party content.

---

## Phase 2 — later (not in current run)

Tasks 9–14 are the roadmap after the basic release (Tasks 1–8). Keep them specified here; do not execute in the current run.

### Task 9: Local library and resume reading

**Files:** `src/library/db.ts` (minimal IndexedDB wrapper, no dependency), `src/library/library.ts`, `src/library/library.test.ts` (use `fake-indexeddb` dev dep), `src/components/RecentList.tsx` (+ css), wire into `Home.tsx`, `ReaderScreen.tsx`, `SettingsPanel.tsx`.

1. `LibraryDoc = { id: string; title: string; blocks: Block[]; createdAt: number; lastOpenedAt: number; progress: number /* 0–1 */; source: 'paste' | 'file' | 'share' | 'ocr'; fileName?: string }`.
2. API: `saveDoc`, `getDoc`, `listDocs()` (sorted by `lastOpenedAt` desc), `updateProgress(id, progress)` (throttled by caller to ≤ 1 write/s), `deleteDoc`, `clearLibrary`. Cap 50 docs: saving the 51st evicts the least recently opened. All functions resolve gracefully (return empty/no-op) when IndexedDB is unavailable.
3. Setting `rememberDocs: boolean` (default `true`) added to settings with a toggle in SettingsPanel: "Zapamiętuj teksty na tym urządzeniu" — when switched off, offer to clear the library.
4. Home shows "Ostatnio czytane"/"Recently read" (up to 6, with title, relative date, progress ring, delete button with undo toast) above the input card when non-empty, plus "Zobacz wszystkie" expanding the full list.
5. Reader restores scroll position from `progress` when reopening and saves progress on scroll.
6. Privacy copy: library lives only in this browser.

### Task 10: OCR for images and scanned PDFs (on-device)

**Files:** `src/ingest/ocr.ts`, `src/components/OcrProgress.tsx` (+ css), updates to `src/ingest/index.ts`, `DropZone.tsx`, i18n. Install `tesseract.js`.

1. Accept `.png,.jpg,.jpeg,.webp` and camera capture on mobile (`<input accept="image/*" capture="environment">` as a secondary "Zrób zdjęcie"/"Take a photo" button).
2. OCR runs fully in the browser. Worker, core wasm and language data (`pol` + `eng`, "fast" models) are self-hosted under `public/ocr/` (copied by a `postinstall`/`npm run ocr-assets` script, not committed if > 5 MB each — document the script) and precached lazily (runtime cache), never fetched from a third-party CDN.
3. `no-text-in-pdf` now offers "Rozpoznaj tekst (OCR)": render each PDF page to canvas via pdfjs and OCR it.
4. Progress UI with page X/Y and percentage, cancel button. Result goes through `parsePlainText`, `source: 'ocr'`, and the reader shows a dismissible note "Tekst rozpoznany automatycznie — mogą być literówki."
5. Tests: unit-test the pure parts (language selection from UI lang, result post-processing); OCR engine itself mocked at the module boundary.

### Task 11: EPUB import and export

**Files:** `src/ingest/epub.ts`, `src/export/exportHtml.ts`, `src/export/exportEpub.ts`, tests, buttons in ReaderScreen top bar ("Pobierz"/"Download" menu). Install `jszip`.

1. Import `.epub`: read `META-INF/container.xml` → OPF → spine order → each XHTML through `htmlToBlocks`; title from OPF `dc:title`. DRM-protected/invalid → `IngestError('read-failed')` with message explaining DRM books can't be opened.
2. Export standalone `.html`: self-contained file with bold baked in (`<b>`), current reader typography as inline CSS, no external requests.
3. Export `.epub` (EPUB 3, single chapter per heading section) with bold baked in, so people can read on e-readers/Kindle (via Send to Kindle).
4. Tests: EPUB round trip (export then import yields equal block texts); HTML export contains `<b>` and no `http` URLs except the project credit link.

### Task 12: Browser extension (Chrome + Firefox) — Gmail, Outlook web, any site

**Files:** `extension/` folder with its own `package.json` using WXT, importing `../src/core` (bolden) — no code duplication. Popup, content script, options.

1. Popup: big on/off toggle "LetterLift na tej stronie", strength slider, "zawsze na tej stronie" per-site memory (`chrome.storage.sync`), link to the web app.
2. Content script bolds text nodes inside readable content (skip `input`, `textarea`, `[contenteditable]`, `code`, `pre`, `script`, `style`, `svg`, already-processed nodes), wraps results in `<span data-letterlift>`; toggling off restores original nodes exactly. Uses `MutationObserver` so newly opened emails in Gmail/Outlook web get processed; work batched with `requestIdleCallback`.
3. Keyboard shortcut Alt+Shift+L toggles on the current tab.
4. Permissions minimal: `storage`, `activeTab`, `scripting`; no host permissions beyond what "always on this site" requests at the moment the user opts in (`optional_host_permissions`).
5. Same visual identity (icon, colours) as the web app.
6. `npm run build` / `npm run zip` produce Chrome and Firefox packages; README section on loading unpacked and store submission (done manually by the owner).
7. Tests: text-node walker + restore round trip in jsdom (DOM after on→off equals the original `innerHTML`).

### Task 13: End-to-end, accessibility and offline quality gate

**Files:** `playwright.config.ts`, `e2e/*.spec.ts`, CI job in `.github/workflows/deploy.yml` (tests must pass before deploy). Dev deps: `@playwright/test`, `@axe-core/playwright`.

1. E2E against `vite preview` on Chromium, Firefox and WebKit, plus a mobile viewport (Pixel 7): paste → read shows bold; upload TXT and DOCX fixtures (`e2e/fixtures/`); settings persist after reload; theme switch; share-target URL `/?text=...` opens reader; library resume; app loads offline after first visit (Chromium only).
2. axe scan of Home, Reader, Settings panel open, About in light and dark: zero serious/critical violations.
3. Fix any defects found in this task (report them in the report file).

### Task 14: Feedback, trust and release polish

**Files:** `.github/ISSUE_TEMPLATE/bug.yml`, `.github/ISSUE_TEMPLATE/idea.yml`, `CHANGELOG.md`, `src/components/Feedback.tsx`, About/Privacy section, version in footer (from `package.json`).

1. In-app "Podziel się opinią"/"Share feedback" opening a prefilled GitHub issue (new tab), and a short "Czy to Ci pomaga?" one-tap Tak/Nie/Nie wiem that just opens the same prefilled issue — no tracking, no backend.
2. Privacy section: plain-language list of what is stored (settings, optional library — locally only), what is never collected.
3. Open Graph / social share meta (title, description, a generated 1200×630 `og.png` made from an SVG in the brand style) so links shared on social media look good.
4. CHANGELOG `1.0.0` entry; `package.json` version `1.0.0`.
