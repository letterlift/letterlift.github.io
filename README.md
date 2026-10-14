# LetterLift

**Let**ter**Li**ft pogrubia początki słów, żeby łatwiej było prowadzić wzrok po tekście. Darmowe, bez konta, bez reklam.

**Otwórz: https://drogazem-design.github.io/letterlift/**

## Co potrafi

- Wklejasz tekst albo wgrywasz plik: TXT, MD, DOCX, PDF
- Regulujesz siłę pogrubienia, krój i rozmiar pisma, odstępy, szerokość linii
- Motywy: jasny, ciemny, sepia
- Linijka czytania i skupienie na akapicie
- Aplikacja instalowana na telefonie (PWA), działa offline
- Po polsku i po angielsku

## Prywatność

Twój tekst jest przetwarzany tylko w Twojej przeglądarce. Nic nie jest wysyłane na żaden serwer. Brak kont, analityki i zewnętrznych usług. W pamięci przeglądarki zapisują się wyłącznie ustawienia czytania.

## Uczciwa uwaga o technice

Niektóre osoby (także z ADHD) uważają, że taki format ułatwia śledzenie tekstu. Inne nie widzą różnicy albo wolą zwykły tekst. LetterLift nie obiecuje, że będziesz czytać szybciej ani lepiej rozumieć. Wypróbuj i zobacz, co działa dla Ciebie.

## Instalacja na telefonie

**Android (Chrome):** otwórz stronę, wybierz menu ⋮ → „Dodaj do ekranu głównego" / „Zainstaluj aplikację". Potem w SMS-ach, Gmailu itp. użyj **Udostępnij → LetterLift**, żeby od razu otworzyć tekst.

**iPhone:** Safari nie obsługuje udostępniania do aplikacji internetowych. Skopiuj tekst, otwórz LetterLift i wklej. Możesz dodać stronę do ekranu głównego (Udostępnij → Do ekranu początkowego).

## Rozwój lokalny

```bash
npm ci
npm run dev      # serwer deweloperski
npm test         # testy (vitest)
npm run build    # build produkcyjny do dist/
```

Deploy: każdy push na `main` uruchamia GitHub Actions (testy, build, publikacja na GitHub Pages). Jednorazowo właściciel repo musi ustawić **Settings → Pages → Source: GitHub Actions**.

## Plany / Roadmap

Planowane, jeszcze niedostępne: rozszerzenie do przeglądarki, OCR (zdjęcia tekstu), EPUB, biblioteka tekstów.

Chcesz, żeby coś powstało w pierwszej kolejności? Zagłosuj, zgłaszając to w [GitHub Issues](https://github.com/drogazem-design/letterlift/issues/new) albo w [anonimowej ankiecie](https://tally.so/r/KpQQ0V) (bez konta).

## Wsparcie

LetterLift jest i zostanie darmowy. Żadna funkcja nie będzie zablokowana za płatnością. Jeśli chcesz, możesz dobrowolnie dorzucić się do kosztów narzędzi AI, z których korzystam: [Tipply](https://tipply.pl/@zem).

## Licencja

GPL-3.0-or-later, zobacz [LICENSE](LICENSE). Możesz używać, zmieniać i udostępniać kod; jeśli rozpowszechniasz zmienioną wersję, musisz udostępnić jej kod na tej samej licencji.

Copyright (C) 2026 Zem (drogazem-design)

Zasady korzystania i informacje o prywatności są na stronie „Prywatność i zasady” w aplikacji (`#privacy`). LetterLift nie jest wyrobem medycznym. Nie służy do diagnozowania ani leczenia ADHD ani żadnych innych zaburzeń i nie zastępuje konsultacji ze specjalistą.

Powstaje z okazji Miesiąca Świadomości ADHD (październik 2026).

---

# LetterLift (English)

**Let**ter**Li**ft bolds the beginnings of words to help your eyes follow the text. Free, no account, no ads.

**Open: https://drogazem-design.github.io/letterlift/**

## Features

- Paste text or upload a file: TXT, MD, DOCX, PDF
- Adjust bold strength, font, size, spacing, line width
- Themes: light, dark, sepia
- Reading ruler and paragraph focus
- Installable on your phone (PWA), works offline
- Polish and English

## Privacy

Your text is processed only in your browser and never sent to any server. No accounts, no analytics, no third-party services. Only your reading settings are stored in the browser.

## An honest note about the technique

Some people (including people with ADHD) find this format easier to follow. Others see no difference or prefer plain text. LetterLift does not claim to make you read faster or understand more. Try it and see what works for your brain.

## Install on your phone

**Android (Chrome):** open the site, then menu ⋮ → "Add to Home screen" / "Install app". After that, in SMS, Gmail etc. use **Share → LetterLift** to open the text straight away.

**iPhone:** Safari does not support the Share target for web apps. Copy the text, open LetterLift and paste. You can still add the site to your Home Screen (Share → Add to Home Screen).

## Local development

```bash
npm ci
npm run dev      # dev server
npm test         # tests (vitest)
npm run build    # production build to dist/
```

Deploy: every push to `main` runs GitHub Actions (tests, build, publish to GitHub Pages). The repo owner must set **Settings → Pages → Source: GitHub Actions** once.

## Roadmap

Planned, not available yet: browser extension, OCR (photos of text), EPUB, text library.

Want something built first? Vote by opening a [GitHub issue](https://github.com/drogazem-design/letterlift/issues/new) or using the [anonymous survey](https://tally.so/r/KpQQ0V) (no account needed).

## Support

LetterLift is and will stay free. No feature will ever be locked behind a payment. If you like, you can voluntarily chip in toward the AI tools I use: [Tipply](https://tipply.pl/@zem).

## Licence

GPL-3.0-or-later, see [LICENSE](LICENSE). You can use, change and share the code; if you distribute a modified version, you must make its source available under the same licence.

Copyright (C) 2026 Zem (drogazem-design)

Terms and privacy information live on the "Privacy & terms" page in the app (`#privacy`). LetterLift is not a medical device. It is not meant to diagnose or treat ADHD or any other condition and does not replace consulting a specialist.

Built for ADHD Awareness Month, October 2026.
