# Noken

A study website for the JLPT (Japanese-Language Proficiency Test), following the **Minna no Nihongo** textbooks. Currently covers **N5**: grammar and vocabulary lesson by lesson, the full verb conjugation table, kana charts, kanji, reference tables, and a practice section with quizzes, drills and spaced-repetition flashcards — all Japanese text rendered with furigana.

The UI language is Spanish, but the codebase is fully i18n-ready: adding a language means adding a typed dictionary and optional per-entry translation keys, no refactoring.

## Stack

- [Astro](https://astro.build) (static output, zero-JS by default) with React islands
- TypeScript (strict), Tailwind CSS v4, shadcn/ui design tokens
- Content stored as JSON in typed content collections (zod schemas)
- pnpm, ESLint, Prettier, Vitest

## Development

```sh
pnpm install
pnpm dev        # dev server on http://localhost:4321
pnpm build      # static build to dist/
pnpm preview    # serve the build locally
pnpm check      # astro check (types)
pnpm lint       # eslint
pnpm format     # prettier
pnpm test       # vitest (furigana, number readings, search, distractors)
```

## Project structure

```
src/
├── content.config.ts   # collections + zod schemas
├── data/n5/            # all learning content; a new level = a new folder here
│   ├── lessons/        # one JSON per lesson (grammar points + examples)
│   ├── vocab/          # one JSON per lesson (word lists)
│   ├── kanji/          # one JSON per kanji, named by the character
│   ├── verbs/          # conjugation table (book appendix V)
│   └── reference/      # one JSON per guide topic (particles, counters…)
├── pages/              # routes (English segments) + search-index.json endpoint
├── layouts/            # BaseLayout (head, settings init) + SiteLayout
├── components/         # feature components (+ React islands)
│   └── practice/       # quiz, drill and flashcard islands
├── ui/                 # static primitives; ui/react = shadcn components
├── i18n/               # locale config + typed UI dictionaries
├── constants/          # levels, word types, kana datasets, storage keys
├── hooks/              # React hooks for islands
├── styles/             # global.css: design tokens, ruby typography, variants
├── types/              # shared content types (Localized…)
└── utils/              # furigana parser, settings, search, practice helpers
```

## Content conventions

- **Furigana notation**: readings are stored inline as `漢字[かんじ]`; a bracket binds to the contiguous kanji run before it, okurigana stays outside: `食[た]べます`. The `Furigana`/`RichText` components render it as `<ruby>`.
- **Localized fields**: `{ "es": "...", "en": "..." }` records per entry; Spanish is required, other locales optional.
- **Levels**: routes and data never hardcode `n5`. Enable a new level in `src/constants/levels.ts` and drop its data in `src/data/<level>/`.

## Routes

| Route                           | Content                                         |
| ------------------------------- | ----------------------------------------------- |
| `/`                             | Landing; the main CTA follows lesson progress   |
| `/kana`                         | Hiragana/katakana charts + reading marks        |
| `/kanji`, `/kanji/[char]`       | Kanji index grouped by level/lesson + detail    |
| `/[level]`                      | Level dashboard                                 |
| `/[level]/lessons/[number]`     | Grammar + vocabulary for a lesson               |
| `/[level]/vocabulary/[number]`  | Dedicated vocabulary view                       |
| `/[level]/verbs`                | Conjugation table (ます/て/diccionario/ない/た) |
| `/[level]/reference/[topic]`    | Guide: particles, counters, time, calendar…     |
| `/[level]/practice`             | Practice hub (progress, streak, per-mode stats) |
| `/[level]/practice/readings`    | Kanji-reading quiz                              |
| `/[level]/practice/kanji`       | Confusable-kanji quiz, both directions          |
| `/[level]/practice/particles`   | Particle cloze quiz built from lesson examples  |
| `/[level]/practice/conjugation` | Verb-form recall drill                          |
| `/[level]/practice/flashcards`  | Leitner flashcards (vocab, kanji, verbs)        |
| `/[level]/practice/numbers`     | Numbers, prices, clock times and counters       |
| `/search-index.json`            | Static index consumed by the search dialog      |

Index routes (`/[level]/lessons`, `/[level]/vocabulary`, `/[level]/practice`, `/[level]/reference`) list their sections.

## Practice

Questions are generated at build time from the same content the pages render, so there is no separate exercise dataset to maintain.

- **Confusable kanji** — asked both ways (meaning → kanji, kanji → meaning). The wrong options are the appendix's own "fáciles de confundir" sets, topped up with kanji of a similar stroke count when the book flags fewer than three.
- **Reading quiz** — prompts show the word with furigana stripped. Distractors are scored so they share the answer's word type and okurigana (`src/utils/distractors.ts`), otherwise options could be eliminated on shape alone.
- **Particle cloze** — a particle is blanked out of a book example. It is only detected after an unambiguous word boundary (a closing `]` or katakana), preferring precision over recall. Distractors are sampled per question from a confusion pool, so the option set never identifies the answer.
- **Conjugation and numbers** — think-then-reveal drills with self-grading; number readings (including sound changes like さんびゃく or じゅっぷん) come from `src/utils/japaneseNumbers.ts`.
- **Flashcards** — Leitner boxes with day-based intervals, plus a virtual "Difíciles" deck built from items missed in any mode.

## Search

`⌘K` / `Ctrl+K` (or `/` while reading) opens a dialog covering vocabulary, kanji, verbs, grammar points, lessons and reference tables. The index is a static JSON file fetched on first open; matching is accent-insensitive for Spanish and strips furigana brackets for Japanese (`src/utils/search.ts`).

Queries also work in **romaji**. Readings are transliterated with a table derived from the kana charts, then both sides are reduced to a loose key (`src/utils/romaji.ts`) so spelling choices stop mattering: Hepburn or kunrei (`shinbun` / `sinbun`, `tsukue` / `tukue`, `jisho` / `zisyo`), long vowels however you write them (`toukyou` / `tokyo` / `tōkyō`), and `shimbun` for `shinbun`. Romaji deliberately loses score ties, so a Spanish word that happens to read like a Japanese one never displaces the real Spanish match.

## Client-side state

Everything a learner accumulates lives in `localStorage` — there is no backend and no account:

| Key                    | Contents                                            |
| ---------------------- | --------------------------------------------------- |
| `noken-settings`       | Theme, furigana visibility and size, study mode     |
| `noken-progress`       | Completed lessons per level                         |
| `noken-flashcards`     | Leitner box and due date per card                   |
| `noken-practice-stats` | Per-mode answer counts, per-lesson accuracy, streak |
| `noken-difficult`      | Miss counts feeding the difficult-words deck        |

Settings are applied before first paint by an inline script in `BaseLayout`, which sets classes on `<html>` (`dark`, `hide-furigana`, `furigana-large`, `hide-translations`, `mac`).
