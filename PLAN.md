# LetterLift — plan

Darmowe narzędzie na Miesiąc/Tydzień Świadomości ADHD (październik 2026).
Pogrubia początki słów, żeby prowadzić wzrok podczas czytania.

## Zasady

- **0 zł**: brak serwera, brak AI, statyczny hosting (GitHub Pages / Cloudflare Pages / Vercel Hobby).
- **Prywatność**: cały tekst przetwarzany w przeglądarce, nic nie jest wysyłane.
- **Open source** (MIT) na GitHubie.
- **Uczciwy przekaz**: „niektórym pomaga, sprawdź czy Tobie” — bez obietnic „2x szybciej”.
- Nie używamy nazwy „Bionic Reading” (znak towarowy) ani „Easy Read” (inne znaczenie).

## Architektura

```
packages/core     bolden(text, opts) — czysta funkcja, Intl.Segmenter, polskie znaki
packages/ingest   PDF (pdf.js), DOCX (mammoth), TXT → model dokumentu
apps/web          PWA (Vite + React + TS): wklej/wrzuć → czytnik z ustawieniami
apps/extension    (po MVP) WXT: Gmail, Outlook web, dowolna strona
```

Model dokumentu: `[{ type: 'heading' | 'paragraph' | 'list', text }]`

## MVP — do końca października

1. `core` + testy (siła pogrubienia, krótkie słowa, myślniki, polskie litery)
2. PWA: wklejanie tekstu + upload TXT/DOCX/PDF
3. Czytnik: suwak siły, rozmiar czcionki, interlinia, szerokość linii, jasny/ciemny
4. Web Share Target (Android: „Udostępnij → LetterLift” z SMS/maila)
5. Strona „O projekcie” + deploy

## Po MVP

- Rozszerzenie przeglądarki (Firefox za darmo, Chrome 5 $ jednorazowo)
- OCR zdjęć (tesseract.js), eksport PDF/EPUB
- Opcjonalnie: dzielenie długich akapitów

## Nakładki — co się da

| Gdzie | Jak |
|---|---|
| Gmail/Outlook w przeglądarce | rozszerzenie |
| Telefon (SMS, Gmail app) | „Udostępnij → LetterLift” (PWA, Android) |
| iOS | tylko kopiuj-wklej (PWA nie obsługuje Share Target) |
