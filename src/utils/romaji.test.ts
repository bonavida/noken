import { describe, expect, it } from 'vitest';
import { romajiKey, toRomaji, toRomajiKey } from '@/utils/romaji';

describe('toRomaji', () => {
  it('transliterates plain kana', () => {
    expect(toRomaji('かいしゃ')).toBe('kaisha');
    expect(toRomaji('でんわ')).toBe('denwa');
    expect(toRomaji('ひらがな')).toBe('hiragana');
  });

  it('doubles the consonant after a small tsu', () => {
    expect(toRomaji('きって')).toBe('kitte');
    expect(toRomaji('がっこう')).toBe('gakkou');
    expect(toRomaji('ざっし')).toBe('zasshi');
  });

  it('lengthens a vowel after the katakana bar', () => {
    expect(toRomaji('コーヒー')).toBe('koohii');
    expect(toRomaji('スーパー')).toBe('suupaa');
  });

  it('handles yōon and katakana', () => {
    expect(toRomaji('きょう')).toBe('kyou');
    expect(toRomaji('シャワー')).toBe('shawaa');
  });

  it('keeps ん and leaves non-kana in place', () => {
    expect(toRomaji('にほん')).toBe('nihon');
    expect(toRomaji('日本[にほん]')).toContain('日本');
  });
});

describe('romajiKey', () => {
  it('treats Hepburn and kunrei spellings as the same', () => {
    expect(romajiKey('shinbun')).toBe(romajiKey('sinbun'));
    expect(romajiKey('tsukue')).toBe(romajiKey('tukue'));
    expect(romajiKey('fuyu')).toBe(romajiKey('huyu'));
    expect(romajiKey('jisho')).toBe(romajiKey('zisyo'));
    expect(romajiKey('chikatetsu')).toBe(romajiKey('tikatetu'));
  });

  it('ignores how a long vowel is written', () => {
    expect(romajiKey('toukyou')).toBe(romajiKey('tokyo'));
    expect(romajiKey('tōkyō')).toBe(romajiKey('tokyo'));
    expect(romajiKey('koohii')).toBe(romajiKey('kōhī'));
    expect(romajiKey('gakkou')).toBe(romajiKey('gakko'));
  });

  it('accepts the m spelling before b, p and m', () => {
    expect(romajiKey('shimbun')).toBe(romajiKey('shinbun'));
  });

  it('is empty for Japanese input, so kana never matches the romaji field', () => {
    expect(romajiKey('会社')).toBe('');
    expect(romajiKey('かいしゃ')).toBe('');
  });
});

describe('toRomajiKey', () => {
  it('turns a reading into the key a learner would type', () => {
    expect(toRomajiKey('かいしゃ')).toBe(romajiKey('kaisha'));
    expect(toRomajiKey('とうきょう')).toBe(romajiKey('tokyo'));
    expect(toRomajiKey('がっこう')).toBe(romajiKey('gakko'));
    expect(toRomajiKey('コーヒー')).toBe(romajiKey('kohi'));
  });
});
