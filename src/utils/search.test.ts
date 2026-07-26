import { describe, expect, it } from 'vitest';
import { normalize, prepareEntries, searchEntries, type SearchEntry } from '@/utils/search';

const ENTRIES: SearchEntry[] = [
  {
    kind: 'vocab',
    jp: '会議室[かいぎしつ]',
    kana: 'かいぎしつ',
    es: 'sala de reuniones',
    href: '/n5/vocabulary/3',
    lesson: 3,
  },
  {
    kind: 'vocab',
    jp: '会社[かいしゃ]',
    kana: 'かいしゃ',
    es: 'empresa',
    href: '/n5/vocabulary/1',
    lesson: 1,
  },
  { kind: 'kanji', jp: '会', kana: 'カイ あう', es: 'reunión, encontrarse', href: '/kanji/会' },
  {
    kind: 'verb',
    jp: '会[あ]います',
    kana: 'あいます',
    es: 'ver a, encontrarse con',
    href: '/n5/verbs',
    lesson: 6,
  },
  {
    kind: 'grammar',
    jp: '〜は 〜です',
    es: 'Afirmación con です',
    href: '/n5/lessons/1#desu',
    lesson: 1,
  },
  { kind: 'lesson', es: 'Lugares y precios', href: '/n5/lessons/3', lesson: 3 },
  { kind: 'reference', es: 'Contadores', href: '/n5/reference/counters' },
];

const prepared = prepareEntries(ENTRIES);
const search = (query: string, limit = 10) => searchEntries(prepared, query, limit);

describe('normalize', () => {
  it('strips Latin accents and lowercases', () => {
    expect(normalize('Lección')).toBe('leccion');
    expect(normalize('Ámbito')).toBe('ambito');
  });

  it('keeps kana with dakuten intact', () => {
    expect(normalize('かいぎしつ')).toBe('かいぎしつ');
    expect(normalize('ぱぴぷ')).toBe('ぱぴぷ');
  });
});

describe('searchEntries', () => {
  it('returns nothing for an empty query', () => {
    expect(search('')).toEqual([]);
    expect(search('   ')).toEqual([]);
  });

  it('matches Spanish meanings without needing accents', () => {
    expect(search('reuniones')[0]?.es).toBe('sala de reuniones');
    expect(search('precio')[0]?.kind).toBe('lesson');
  });

  it('finds a lesson by its number', () => {
    const [first] = search('3');
    expect(first?.kind).toBe('lesson');
    expect(first?.href).toBe('/n5/lessons/3');
  });

  it('matches the kanji form with furigana brackets stripped', () => {
    const hrefs = search('会議室').map(({ href }) => href);
    expect(hrefs).toContain('/n5/vocabulary/3');
  });

  it('matches readings', () => {
    expect(search('かいしゃ')[0]?.es).toBe('empresa');
  });

  it('ranks an exact match above a partial one', () => {
    const [first] = search('会');
    expect(first?.kind).toBe('kanji');
  });

  it('ranks a word starting with the query above one merely containing it', () => {
    const results = search('あいます');
    expect(results[0]?.kind).toBe('verb');
  });

  it('respects the limit', () => {
    expect(search('a', 2)).toHaveLength(2);
  });

  it('finds grammar points by their pattern', () => {
    expect(search('です').some(({ kind }) => kind === 'grammar')).toBe(true);
  });
});
