// Matching for the site-wide search. The index is small enough (~1.5k entries)
// that scoring every entry on each keystroke is imperceptible, so this stays
// dependency-free instead of pulling in a fuzzy-search library.
import { stripFurigana } from '@/utils/furigana';

export type SearchKind = 'vocab' | 'kanji' | 'verb' | 'grammar' | 'lesson' | 'reference';

export interface SearchEntry {
  kind: SearchKind;
  // Japanese side in furigana bracket notation, when the entry has one
  jp?: string;
  // Reading, shown next to the result and matched against
  kana?: string;
  // Spanish side: meaning, title or description
  es: string;
  href: string;
  lesson?: number;
}

export interface Searchable extends SearchEntry {
  // Normalized haystacks, built once when the index loads
  fields: string[];
}

// Lowercase and drop Latin accents while leaving kana intact: NFD splits the
// accents off so they can be removed, NFC puts dakuten back together.
export const normalize = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .normalize('NFC')
    .toLowerCase();

// Whole field > starts with > starts a word > appears anywhere
const fieldScore = (field: string, query: string): number => {
  const index = field.indexOf(query);
  if (index < 0) return 0;
  if (field === query) return 100;
  if (index === 0) return 70;
  if (field[index - 1] === ' ') return 45;
  return 20;
};

// Nudges so a word beats the lesson that contains it on an equal match
const KIND_BONUS: Record<SearchKind, number> = {
  vocab: 6,
  kanji: 5,
  verb: 4,
  grammar: 3,
  lesson: 1,
  reference: 1,
};

export const prepareEntries = (entries: SearchEntry[]): Searchable[] =>
  entries.map((entry) => ({
    ...entry,
    fields: [
      entry.jp ? stripFurigana(entry.jp) : '',
      entry.kana ?? '',
      entry.es,
      // Lessons are looked up by number ("5"), not just by title
      entry.kind === 'lesson' && entry.lesson != null ? String(entry.lesson) : '',
    ]
      .filter(Boolean)
      .map(normalize),
  }));

const entryScore = (entry: Searchable, query: string): number => {
  const best = Math.max(...entry.fields.map((field) => fieldScore(field, query)));
  return best === 0 ? 0 : best + KIND_BONUS[entry.kind];
};

export const searchEntries = (
  entries: Searchable[],
  rawQuery: string,
  limit: number
): Searchable[] => {
  const query = normalize(rawQuery.trim());
  if (!query) return [];

  return entries
    .map((entry) => ({ entry, score: entryScore(entry, query) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ entry }) => entry);
};
