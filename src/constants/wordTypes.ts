// Language-neutral keys; display labels live in the i18n dictionaries
export const WORD_TYPES = [
  'noun',
  'verb-godan',
  'verb-ichidan',
  'verb-irregular',
  'adjective-i',
  'adjective-na',
  'adverb',
  'particle',
  'expression',
  'counter',
  'pronoun',
  'interrogative',
  'conjunction',
  'number',
] as const;

export type WordType = (typeof WORD_TYPES)[number];
