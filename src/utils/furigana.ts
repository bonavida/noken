export interface FuriganaSegment {
  base: string;
  ruby?: string;
}

// A reading in brackets binds to the contiguous kanji run right before it:
// "食[た]べます" → [{ base: '食', ruby: 'た' }, { base: 'べます' }]
const KANJI_RUN_WITH_READING = /([一-鿿㐀-䶿々〆〇ヶ]+)\[([^\]]+)\]/g;

export const parseFurigana = (text: string): FuriganaSegment[] => {
  const segments: FuriganaSegment[] = [];
  let lastIndex = 0;

  const matches = text.matchAll(KANJI_RUN_WITH_READING);
  const pushPlain = (plain: string) => {
    if (plain) segments.push({ base: plain });
  };

  [...matches].forEach((match) => {
    const [, base, ruby] = match;
    pushPlain(text.slice(lastIndex, match.index));
    segments.push({ base: base ?? '', ruby });
    lastIndex = (match.index ?? 0) + match[0].length;
  });

  pushPlain(text.slice(lastIndex));
  return segments;
};

// Plain text without readings, for <title>, meta descriptions, and aria labels
export const stripFurigana = (text: string): string => text.replace(KANJI_RUN_WITH_READING, '$1');
