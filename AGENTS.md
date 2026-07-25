# Noken — project notes

JLPT study site (Minna no Nihongo). Astro static + React islands, TS strict, Tailwind v4, pnpm.

## Rules

- Everything in the codebase is English (routes, code, comments, docs). Spanish only in rendered UI strings (`src/i18n/dictionaries/es.ts`) and content `es` fields.
- Every Japanese string with kanji uses furigana bracket notation `漢字[かんじ]` and renders through `Furigana.astro` / `FuriganaText.tsx` / `RichText.astro`.
- Never hardcode `n5` in pages; iterate `ENABLED_LEVELS` (src/constants/levels.ts).
- Grammar explanations are original Spanish paraphrases — never copy the textbook's prose.
- Commits: plain messages, no Co-Authored-By trailer.

## Commands

pnpm dev / build / preview / check / lint / format / test

## Dev server

When starting the dev server, use background mode: `astro dev --background`
(manage with `astro dev stop|status|logs`).
