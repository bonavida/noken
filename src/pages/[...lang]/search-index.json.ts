import { ENABLED_LEVELS, type EnabledLevel } from '@/constants/levels';
import { LOCALES, type Locale } from '@/i18n/config';
import { localeParam } from '@/i18n/routing';
import { localePath, pickLocale, pickLocaleList } from '@/i18n/t';
import type { SearchEntry } from '@/utils/search';
import { getCollection } from 'astro:content';

// One static index for the whole site, fetched by the search dialog the first
// time it opens. Built at compile time so no server is involved.
const isEnabled = (level: string): level is EnabledLevel =>
  ENABLED_LEVELS.includes(level as EnabledLevel);

// Kanji readings carry okurigana dots and prefix marks that would break matching
const cleanReading = (reading: string) => reading.replace(/[.〜]/g, '');

// One index per language: the entries carry that language's meanings and its
// own hrefs, so a search never sends the reader to the other tree.
export const getStaticPaths = () =>
  LOCALES.map((locale) => ({ params: { lang: localeParam(locale) }, props: { locale } }));

export const GET = async ({ props }: { props: { locale: Locale } }) => {
  const { locale } = props;

  const [lessons, vocab, kanji, verbs, reference] = await Promise.all([
    getCollection('lessons', ({ data }) => isEnabled(data.level)),
    getCollection('vocab', ({ data }) => isEnabled(data.level)),
    getCollection('kanji', ({ data }) => isEnabled(data.level)),
    getCollection('verbs', ({ data }) => isEnabled(data.level)),
    getCollection('reference', ({ data }) => isEnabled(data.level)),
  ]);

  const vocabEntries: SearchEntry[] = vocab.flatMap(({ data }) =>
    data.words.map((word) => ({
      kind: 'vocab' as const,
      jp: word.word,
      kana: word.kana,
      es: pickLocale(word.meaning, locale),
      href: localePath(`/${data.level}/vocabulary/${data.lesson}`, locale),
      lesson: data.lesson,
    }))
  );

  const kanjiEntries: SearchEntry[] = kanji.map(({ data }) => ({
    kind: 'kanji' as const,
    jp: data.character,
    kana: [...data.onyomi, ...data.kunyomi].map(cleanReading).join(' '),
    es: pickLocaleList(data.meanings, locale).join(', '),
    href: localePath(`/kanji/${data.character}`, locale),
    ...(data.lesson && { lesson: data.lesson }),
  }));

  const verbEntries: SearchEntry[] = verbs.flatMap(({ data }) =>
    data.verbs.map((verb) => ({
      kind: 'verb' as const,
      jp: verb.verb,
      kana: `${verb.masu} ${verb.dictionary}`,
      es: pickLocale(verb.meaning, locale),
      href: localePath(`/${data.level}/verbs#${verb.id}`, locale),
      lesson: verb.lesson,
    }))
  );

  const grammarEntries: SearchEntry[] = lessons.flatMap(({ data }) =>
    data.grammar.map((point) => ({
      kind: 'grammar' as const,
      jp: pickLocale(point.pattern, locale),
      es: pickLocale(point.title, locale),
      href: localePath(`/${data.level}/lessons/${data.number}#${point.id}`, locale),
      lesson: data.number,
    }))
  );

  const lessonEntries: SearchEntry[] = lessons.map(({ data }) => ({
    kind: 'lesson' as const,
    ...(data.jpTitle && { jp: data.jpTitle }),
    es: pickLocale(data.title, locale),
    href: localePath(`/${data.level}/lessons/${data.number}`, locale),
    lesson: data.number,
  }));

  const referenceEntries: SearchEntry[] = reference.map(({ data }) => ({
    kind: 'reference' as const,
    es: `${pickLocale(data.title, locale)} — ${pickLocale(data.description, locale)}`,
    href: localePath(`/${data.level}/reference/${data.slug}`, locale),
  }));

  const entries = [
    ...vocabEntries,
    ...kanjiEntries,
    ...verbEntries,
    ...grammarEntries,
    ...lessonEntries,
    ...referenceEntries,
  ];

  return new Response(JSON.stringify(entries), {
    headers: { 'Content-Type': 'application/json' },
  });
};
