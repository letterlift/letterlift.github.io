export const pl = {
  nav: {
    home: 'LetterLift, strona główna',
    about: 'O projekcie',
    langGroup: 'Język',
    pl: 'Polski',
    en: 'English',
    main: 'Główna nawigacja',
  },
  hero: {
    headline: 'Czytaj tak, jak lubi Twój mózg.',
    sub: 'LetterLift pogrubia początek każdego słowa, żeby oko miało się czego złapać. Niektórym osobom czyta się dzięki temu łatwiej. Sprawdź, czy Tobie.',
    privacy: 'Twój tekst nie opuszcza Twojego urządzenia.',
  },
  demo: {
    title: 'Zobacz różnicę od razu',
    sample:
      'Przeczytaj to zdanie raz z pogrubieniem i raz bez, a potem zdecyduj, w której wersji łatwiej Ci utrzymać uwagę na linijce.',
    strength: 'Siła pogrubienia',
    toggle: 'Pogrubianie początków słów',
    on: 'Włączone',
    off: 'Wyłączone',
    hint: 'Przesuń suwak albo wyłącz pogrubianie i zobacz, co się zmienia.',
  },
  input: {
    heading: 'Twój tekst',
    tablist: 'Skąd wziąć tekst',
    tabPaste: 'Wklej tekst',
    tabUpload: 'Wgraj plik',
    textareaLabel: 'Tekst do przeczytania',
    placeholder:
      'Wklej tutaj artykuł, maila, rozdział książki albo notatki z zajęć. Na przykład: „Dzisiejsze spotkanie zaczniemy od krótkiego podsumowania zeszłego tygodnia…”',
    counter: (n: number) => `${n.toLocaleString('pl-PL')} znaków`,
    read: 'Czytaj',
  },
  drop: {
    label: 'Wybierz plik z tekstem',
    prompt: 'Przeciągnij plik tutaj',
    or: 'albo kliknij, żeby go wybrać',
    dragging: 'Upuść plik, żeby go wczytać',
    formats: 'Obsługiwane formaty: TXT, MD, DOCX, PDF. Maksymalnie 20 MB.',
    loading: 'Wczytuję plik…',
    errors: {
      unsupported:
        'Ten typ pliku nie jest obsługiwany. Wybierz plik TXT, MD, DOCX lub PDF albo wklej tekst.',
      'too-large':
        'Plik jest większy niż 20 MB. Wybierz mniejszy plik albo wklej sam fragment tekstu.',
      empty:
        'W tym pliku nie ma tekstu. Sprawdź, czy to właściwy plik, albo wklej treść ręcznie.',
      'no-text-in-pdf':
        'Ten PDF wygląda na skan, więc nie ma w nim tekstu do odczytania. Spróbuj wersji z tekstem albo wklej treść.',
      'read-failed':
        'Nie udało się odczytać pliku. Spróbuj jeszcze raz, wybierz inny plik albo wklej tekst.',
    },
  },
  tiles: {
    heading: 'Jak to może pomóc',
    privacy: {
      title: 'Zostaje u Ciebie',
      body: 'Tekst jest przetwarzany w Twojej przeglądarce. Bez konta, bez wysyłania na serwer, bez analityki.',
    },
    free: {
      title: 'Za darmo i otwarte',
      body: 'Bez opłat i reklam. Kod jest otwarty na licencji MIT, każdy może go sprawdzić.',
    },
    adjust: {
      title: 'Ustawisz pod siebie',
      body: 'Siła pogrubienia, rozmiar liter, odstępy i motyw. Zmieniaj, aż będzie Ci wygodnie.',
    },
  },
  footer: {
    made: 'Zrobione z ❤️ na Miesiąc Świadomości ADHD 2026',
    github: 'Kod na GitHubie',
    license: 'Licencja MIT',
  },
  reader: {
    back: '← Nowy tekst',
    untitled: 'Twój tekst',
  },
  about: {
    back: '← Wróć',
    title: 'O projekcie',
    lead: 'LetterLift to darmowe narzędzie, które pogrubia początki słów, żeby łatwiej było śledzić tekst wzrokiem.',
    whatTitle: 'Na czym polega ta technika',
    what: 'W każdym słowie pogrubiamy kilka pierwszych liter. Oko dostaje punkty zaczepienia i łatwiej przeskakuje od słowa do słowa. Możesz ustawić, ile liter ma być pogrubionych, i w każdej chwili wyłączyć pogrubianie.',
    researchTitle: 'Co mówią badania',
    research:
      'Szczerze: wyniki badań są niejednoznaczne. Nie ma dowodów, że to przyspiesza czytanie albo poprawia zrozumienie. Część osób, także z ADHD, mówi jednak, że takie wyróżnienie pomaga im nie gubić linijki. Spróbuj i zobacz, co działa u Ciebie. Jeśli nie pomaga, to też w porządku.',
    tipsTitle: 'Inne rzeczy, które pomagają niektórym',
    tips: [
      'Większy tekst i większe odstępy między liniami. W czytniku możesz je dopasować.',
      'Krótsze sesje. Kilkanaście minut, przerwa, potem dalej.',
      'Audiobooki albo czytanie na głos, jeśli słuchanie idzie Ci lepiej niż czytanie.',
      'Mniej bodźców wokół: zamknięte karty, wyciszone powiadomienia.',
    ],
    privacyTitle: 'Prywatność',
    privacy:
      'Twój tekst nie opuszcza Twojego urządzenia. LetterLift nie ma serwera, który go odbiera, nie używa analityki i nie zakłada kont. W pamięci przeglądarki zapisujemy tylko Twoje ustawienia i wybrany język.',
    creditsTitle: 'Podziękowania',
    credits:
      'Czcionki: Bricolage Grotesque oraz Atkinson Hyperlegible (Braille Institute), zaprojektowana z myślą o czytelności. Odczyt plików: mammoth (DOCX) i pdf.js (PDF). Kod na licencji MIT.',
    source: 'Kod źródłowy na GitHubie',
  },
}
