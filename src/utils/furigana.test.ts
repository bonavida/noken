import { describe, expect, it } from 'vitest';
import { parseFurigana, stripFurigana } from './furigana';

describe('parseFurigana', () => {
  it('returns a single plain segment for kana-only text', () => {
    expect(parseFurigana('これはペンです')).toEqual([{ base: 'これはペンです' }]);
  });

  it('parses a single kanji run with its reading', () => {
    expect(parseFurigana('学生[がくせい]')).toEqual([{ base: '学生', ruby: 'がくせい' }]);
  });

  it('keeps okurigana outside the ruby segment', () => {
    expect(parseFurigana('食[た]べます')).toEqual([{ base: '食', ruby: 'た' }, { base: 'べます' }]);
  });

  it('parses multiple runs inside a sentence', () => {
    expect(parseFurigana('私[わたし]は日本語[にほんご]を勉強[べんきょう]します')).toEqual([
      { base: '私', ruby: 'わたし' },
      { base: 'は' },
      { base: '日本語', ruby: 'にほんご' },
      { base: 'を' },
      { base: '勉強', ruby: 'べんきょう' },
      { base: 'します' },
    ]);
  });

  it('handles consecutive bracketed runs', () => {
    expect(parseFurigana('毎日[まいにち]働[はたら]く')).toEqual([
      { base: '毎日', ruby: 'まいにち' },
      { base: '働', ruby: 'はたら' },
      { base: 'く' },
    ]);
  });

  it('supports the iteration mark 々', () => {
    expect(parseFurigana('人々[ひとびと]')).toEqual([{ base: '人々', ruby: 'ひとびと' }]);
  });

  it('leaves kanji without brackets as plain text', () => {
    expect(parseFurigana('日本')).toEqual([{ base: '日本' }]);
  });

  it('returns an empty list for an empty string', () => {
    expect(parseFurigana('')).toEqual([]);
  });
});

describe('stripFurigana', () => {
  it('removes readings but keeps the base text', () => {
    expect(stripFurigana('私[わたし]は日本語[にほんご]を勉強[べんきょう]します')).toBe(
      '私は日本語を勉強します'
    );
  });

  it('returns kana-only text unchanged', () => {
    expect(stripFurigana('これはペンです')).toBe('これはペンです');
  });
});
