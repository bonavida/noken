import { describe, expect, it } from 'vitest';
import { COUNTERS, minutesToKana, numberToKana, priceToKana, timeToKana } from './japaneseNumbers';

describe('numberToKana', () => {
  it('reads zero and units', () => {
    expect(numberToKana(0)).toBe('ゼロ');
    expect(numberToKana(1)).toBe('いち');
    expect(numberToKana(7)).toBe('なな');
  });

  it('reads tens', () => {
    expect(numberToKana(10)).toBe('じゅう');
    expect(numberToKana(11)).toBe('じゅういち');
    expect(numberToKana(42)).toBe('よんじゅうに');
    expect(numberToKana(90)).toBe('きゅうじゅう');
  });

  it('applies the hundreds sound changes', () => {
    expect(numberToKana(100)).toBe('ひゃく');
    expect(numberToKana(300)).toBe('さんびゃく');
    expect(numberToKana(600)).toBe('ろっぴゃく');
    expect(numberToKana(800)).toBe('はっぴゃく');
  });

  it('applies the thousands sound changes', () => {
    expect(numberToKana(1000)).toBe('せん');
    expect(numberToKana(3000)).toBe('さんぜん');
    expect(numberToKana(8000)).toBe('はっせん');
  });

  it('composes 万 with the rest', () => {
    expect(numberToKana(10000)).toBe('いちまん');
    expect(numberToKana(34500)).toBe('さんまんよんせんごひゃく');
    expect(numberToKana(20026)).toBe('にまんにじゅうろく');
  });

  it('rejects out-of-range input', () => {
    expect(() => numberToKana(-1)).toThrow();
    expect(() => numberToKana(100000)).toThrow();
  });
});

describe('priceToKana', () => {
  it('appends えん', () => {
    expect(priceToKana(3400)).toBe('さんぜんよんひゃくえん');
  });
});

describe('minutesToKana', () => {
  it('applies the っぷん sound changes', () => {
    expect(minutesToKana(1)).toBe('いっぷん');
    expect(minutesToKana(6)).toBe('ろっぷん');
    expect(minutesToKana(8)).toBe('はっぷん');
    expect(minutesToKana(10)).toBe('じゅっぷん');
    expect(minutesToKana(15)).toBe('じゅうごふん');
    expect(minutesToKana(20)).toBe('にじゅっぷん');
    expect(minutesToKana(45)).toBe('よんじゅうごふん');
  });
});

describe('timeToKana', () => {
  it('uses the irregular hour readings', () => {
    expect(timeToKana(4, 0)).toEqual(['よじ']);
    expect(timeToKana(7, 0)).toEqual(['しちじ']);
    expect(timeToKana(9, 15)).toEqual(['くじじゅうごふん']);
  });

  it('accepts both readings for half past', () => {
    expect(timeToKana(7, 30)).toEqual(['しちじはん', 'しちじさんじゅっぷん']);
  });
});

describe('COUNTERS', () => {
  it('keeps the irregular person counters', () => {
    expect(COUNTERS.nin[1]).toBe('ひとり');
    expect(COUNTERS.nin[2]).toBe('ふたり');
    expect(COUNTERS.nin[4]).toBe('よにん');
  });

  it('applies the 本 sound changes', () => {
    expect(COUNTERS.hon[1]).toBe('いっぽん');
    expect(COUNTERS.hon[3]).toBe('さんぼん');
    expect(COUNTERS.hon[6]).toBe('ろっぽん');
  });
});
