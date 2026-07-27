import { describe, expect, it } from 'vitest';
import { okuriganaTail, pickDistractors, type DistractorCandidate } from '@/utils/distractors';

const word = (kana: string, type: string, stripped: string): DistractorCandidate => ({
  kana,
  type,
  stripped,
});

const POOL: DistractorCandidate[] = [
  word('たべます', 'verb-ichidan', '食べます'),
  word('みます', 'verb-ichidan', '見ます'),
  word('かいます', 'verb-godan', '買います'),
  word('よみます', 'verb-godan', '読みます'),
  word('かいしゃ', 'noun', '会社'),
  word('かいぎしつ', 'noun', '会議室'),
  word('でんわ', 'noun', '電話'),
  word('がっこう', 'noun', '学校'),
  word('ほん', 'noun', '本'),
  word('たかい', 'adjective-i', '高い'),
  word('やすい', 'adjective-i', '安い'),
];

// Fixed sequence keeps the tie-break deterministic in tests
const noJitter = () => 0;

describe('okuriganaTail', () => {
  it('returns the trailing kana a prompt gives away', () => {
    expect(okuriganaTail('食べます')).toBe('べます');
    expect(okuriganaTail('買います')).toBe('います');
    expect(okuriganaTail('高い')).toBe('い');
  });

  it('is empty for words that are all kanji', () => {
    expect(okuriganaTail('会議室')).toBe('');
    expect(okuriganaTail('時々')).toBe('');
  });
});

describe('pickDistractors', () => {
  it('never offers the answer back as an option', () => {
    const answer = word('かいしゃ', 'noun', '会社');
    expect(pickDistractors(answer, POOL, 3, noJitter)).not.toContain('かいしゃ');
  });

  it('returns the requested number of unique options', () => {
    const answer = word('でんわ', 'noun', '電話');
    const distractors = pickDistractors(answer, POOL, 3, noJitter);
    expect(distractors).toHaveLength(3);
    expect(new Set(distractors).size).toBe(3);
  });

  it('keeps nouns away from options ending in ます', () => {
    const answer = word('かいしゃ', 'noun', '会社');
    const distractors = pickDistractors(answer, POOL, 3, noJitter);
    expect(distractors.every((kana) => !kana.endsWith('ます'))).toBe(true);
  });

  it('matches the okurigana of a verb prompt', () => {
    const answer = word('のみます', 'verb-godan', '飲みます');
    const distractors = pickDistractors(answer, POOL, 3, noJitter);
    expect(distractors.every((kana) => kana.endsWith('ます'))).toBe(true);
  });

  it('prefers the same word type and okurigana over a mere length match', () => {
    const answer = word('ききます', 'verb-godan', '聞きます');
    const [best] = pickDistractors(answer, POOL, 1, noJitter);
    expect(['かいます', 'よみます']).toContain(best);
  });

  it('falls back to whatever exists when the pool is thin', () => {
    const answer = word('かいしゃ', 'noun', '会社');
    const thin = [word('たべます', 'verb-ichidan', '食べます')];
    expect(pickDistractors(answer, thin, 3, noJitter)).toEqual(['たべます']);
  });
});
