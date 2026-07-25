# Noken

A study website for the JLPT (Japanese-Language Proficiency Test), following the **Minna no Nihongo** textbooks. Currently covers **N5** with grammar, vocabulary, kana charts, and kanji — all Japanese text rendered with furigana.

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
pnpm test       # vitest (furigana parser)
```

## Project structure

```
src/
├── content.config.ts   # collections + zod schemas (lessons, vocab, kanji)
├── data/n5/            # all learning content; a new level = a new folder here
│   ├── lessons/        # one JSON per lesson (grammar points + examples)
│   ├── vocab/          # one JSON per lesson (word lists)
│   ├── kanji/          # one JSON per kanji, named by the character
│   ├── verbs/          # conjugation table (book appendix V)
│   └── reference/      # one JSON per guide topic (particles, counters…)
├── pages/              # routes (English segments)
├── layouts/            # BaseLayout (head, settings init) + SiteLayout
├── components/         # feature components (+ React islands)
├── ui/                 # static primitives; ui/react = shadcn components
├── i18n/               # locale config + typed UI dictionaries
├── constants/          # levels, word types, kana datasets, settings keys
├── hooks/              # React hooks for islands
└── utils/              # furigana parser, settings, cn
```

## Content conventions

- **Furigana notation**: readings are stored inline as `漢字[かんじ]`; a bracket binds to the contiguous kanji run before it, okurigana stays outside: `食[た]べます`. The `Furigana`/`RichText` components render it as `<ruby>`.
- **Localized fields**: `{ "es": "...", "en": "..." }` records per entry; Spanish is required, other locales optional.
- **Levels**: routes and data never hardcode `n5`. Enable a new level in `src/constants/levels.ts` and drop its data in `src/data/<level>/`.

## Routes

| Route                          | Content                                         |
| ------------------------------ | ----------------------------------------------- |
| `/`                            | Landing + level picker                          |
| `/kana`                        | Hiragana/katakana charts (level-independent)    |
| `/kanji`, `/kanji/[char]`      | Kanji index grouped by level/lesson + detail    |
| `/[level]`                     | Level dashboard                                 |
| `/[level]/lessons/[number]`    | Grammar + vocabulary for a lesson               |
| `/[level]/vocabulary/[number]` | Dedicated vocabulary view                       |
| `/[level]/verbs`               | Conjugation table (ます/て/diccionario/ない/た) |
| `/[level]/reference/[topic]`   | Guide: particles, counters, time, calendar…     |
