// Kana → romaji, plus a loose key so a learner's typing matches whatever
// romanization the reading happens to use. The syllable table is derived from
// the kana charts, so it can never drift from what the site teaches.
import { DAKUTEN_ROWS, GOJUON_ROWS, YOON_ROWS } from '@/constants/kana';

const SYLLABLES = new Map<string, string>();
[...GOJUON_ROWS, ...DAKUTEN_ROWS, ...YOON_ROWS].flat().forEach((entry) => {
  if (!entry) return;
  SYLLABLES.set(entry.hiragana, entry.romaji);
  SYLLABLES.set(entry.katakana, entry.romaji);
});

const SMALL_VOWELS = new Map([
  ['ぁ', 'a'],
  ['ァ', 'a'],
  ['ぃ', 'i'],
  ['ィ', 'i'],
  ['ぅ', 'u'],
  ['ゥ', 'u'],
  ['ぇ', 'e'],
  ['ェ', 'e'],
  ['ぉ', 'o'],
  ['ォ', 'o'],
]);

const SMALL_Y = new Map([
  ['ゃ', 'ya'],
  ['ャ', 'ya'],
  ['ゅ', 'yu'],
  ['ュ', 'yu'],
  ['ょ', 'yo'],
  ['ョ', 'yo'],
]);

const SOKUON = new Set(['っ', 'ッ']);
const CHOONPU = new Set(['ー', '－']);

export const toRomaji = (text: string): string => {
  let result = '';

  for (let index = 0; index < text.length; index += 1) {
    // Two-character combinations (yōon) must win over the single kana
    const pair = SYLLABLES.get(text.slice(index, index + 2));
    if (pair) {
      result += pair;
      index += 1;
      continue;
    }

    const character = text[index]!;
    const syllable = SYLLABLES.get(character);
    if (syllable) {
      result += syllable;
      continue;
    }

    if (SOKUON.has(character)) {
      // A small tsu doubles the consonant that follows it
      const next =
        SYLLABLES.get(text.slice(index + 1, index + 3)) ?? SYLLABLES.get(text[index + 1] ?? '');
      if (next) result += next.startsWith('ch') ? 't' : next[0];
      continue;
    }

    if (CHOONPU.has(character)) {
      result += result.match(/[aeiou](?=[^aeiou]*$)/)?.[0] ?? '';
      continue;
    }

    const smallVowel = SMALL_VOWELS.get(character);
    if (smallVowel) {
      // フォ → fu + o → fo
      result = result.replace(/[aeiou]$/, '') + smallVowel;
      continue;
    }

    const smallY = SMALL_Y.get(character);
    if (smallY) {
      result = result.replace(/i$/, '') + smallY;
      continue;
    }

    // Kanji, punctuation and separators keep their place so words stay apart
    result += /\s/.test(character) ? ' ' : character;
  }

  return result;
};

// Collapses the ways the same reading gets typed: macrons or doubled vowels,
// Hepburn or kunrei (shi/si, tsu/tu, fu/hu, ji/zi), shimbun or shinbun.
export const romajiKey = (text: string): string =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .replace(/shi/g, 'si')
    .replace(/sh/g, 'sy')
    .replace(/chi/g, 'ti')
    .replace(/ch/g, 'ty')
    .replace(/tsu/g, 'tu')
    .replace(/fu/g, 'hu')
    .replace(/ji/g, 'zi')
    .replace(/j/g, 'zy')
    .replace(/m(?=[bpm])/g, 'n')
    .replace(/nn/g, 'n')
    .replace(/ou|oo/g, 'o')
    .replace(/uu/g, 'u')
    .replace(/ei|ee/g, 'e')
    .replace(/aa/g, 'a')
    .replace(/ii/g, 'i');

export const toRomajiKey = (kana: string): string => romajiKey(toRomaji(kana));
