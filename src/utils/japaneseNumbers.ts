// Kana readings for numbers, prices, clock times and counters, including the
// N5 sound changes (さんびゃく, ろっぴゃく, さんぜん, はっせん, じゅっぷん…).

const UNITS = ['', 'いち', 'に', 'さん', 'よん', 'ご', 'ろく', 'なな', 'はち', 'きゅう'];

const HUNDREDS = [
  '',
  'ひゃく',
  'にひゃく',
  'さんびゃく',
  'よんひゃく',
  'ごひゃく',
  'ろっぴゃく',
  'ななひゃく',
  'はっぴゃく',
  'きゅうひゃく',
];

const THOUSANDS = [
  '',
  'せん',
  'にせん',
  'さんぜん',
  'よんせん',
  'ごせん',
  'ろくせん',
  'ななせん',
  'はっせん',
  'きゅうせん',
];

export const numberToKana = (value: number): string => {
  if (!Number.isInteger(value) || value < 0 || value > 99999) {
    throw new Error(`numberToKana supports integers 0-99999, got ${value}`);
  }
  if (value === 0) return 'ゼロ';

  const man = Math.floor(value / 10000);
  const thousands = Math.floor((value % 10000) / 1000);
  const hundreds = Math.floor((value % 1000) / 100);
  const tens = Math.floor((value % 100) / 10);
  const units = value % 10;

  const tensWord = tens === 0 ? '' : `${tens > 1 ? UNITS[tens] : ''}じゅう`;

  return [
    man > 0 ? `${numberToKana(man)}まん` : '',
    THOUSANDS[thousands],
    HUNDREDS[hundreds],
    tensWord,
    UNITS[units],
  ].join('');
};

export const priceToKana = (value: number): string => `${numberToKana(value)}えん`;

const HOURS = [
  '',
  'いちじ',
  'にじ',
  'さんじ',
  'よじ',
  'ごじ',
  'ろくじ',
  'しちじ',
  'はちじ',
  'くじ',
  'じゅうじ',
  'じゅういちじ',
  'じゅうにじ',
];

const MINUTE_UNITS = [
  '',
  'いっぷん',
  'にふん',
  'さんぷん',
  'よんぷん',
  'ごふん',
  'ろっぷん',
  'ななふん',
  'はっぷん',
  'きゅうふん',
];

const MINUTE_TENS = [
  '',
  'じゅっぷん',
  'にじゅっぷん',
  'さんじゅっぷん',
  'よんじゅっぷん',
  'ごじゅっぷん',
];
const MINUTE_TENS_PREFIX = ['', 'じゅう', 'にじゅう', 'さんじゅう', 'よんじゅう', 'ごじゅう'];

export const minutesToKana = (minutes: number): string => {
  if (!Number.isInteger(minutes) || minutes < 0 || minutes > 59) {
    throw new Error(`minutesToKana supports 0-59, got ${minutes}`);
  }
  if (minutes === 0) return '';
  const tens = Math.floor(minutes / 10);
  const units = minutes % 10;
  if (units === 0) return MINUTE_TENS[tens];
  return `${MINUTE_TENS_PREFIX[tens]}${MINUTE_UNITS[units]}`;
};

// Returns every accepted reading; :30 also reads as 〜じはん
export const timeToKana = (hour: number, minutes: number): string[] => {
  if (!Number.isInteger(hour) || hour < 1 || hour > 12) {
    throw new Error(`timeToKana supports hours 1-12, got ${hour}`);
  }
  const base = `${HOURS[hour]}${minutesToKana(minutes)}`;
  if (minutes === 30) return [`${HOURS[hour]}はん`, base];
  return [base];
};

// Counters drilled in practice mode; index = quantity (1-10)
export const COUNTERS = {
  nin: [
    '',
    'ひとり',
    'ふたり',
    'さんにん',
    'よにん',
    'ごにん',
    'ろくにん',
    'ななにん',
    'はちにん',
    'きゅうにん',
    'じゅうにん',
  ],
  tsu: [
    '',
    'ひとつ',
    'ふたつ',
    'みっつ',
    'よっつ',
    'いつつ',
    'むっつ',
    'ななつ',
    'やっつ',
    'ここのつ',
    'とお',
  ],
  mai: [
    '',
    'いちまい',
    'にまい',
    'さんまい',
    'よんまい',
    'ごまい',
    'ろくまい',
    'ななまい',
    'はちまい',
    'きゅうまい',
    'じゅうまい',
  ],
  hon: [
    '',
    'いっぽん',
    'にほん',
    'さんぼん',
    'よんほん',
    'ごほん',
    'ろっぽん',
    'ななほん',
    'はっぽん',
    'きゅうほん',
    'じゅっぽん',
  ],
  kai: [
    '',
    'いっかい',
    'にかい',
    'さんかい',
    'よんかい',
    'ごかい',
    'ろっかい',
    'ななかい',
    'はっかい',
    'きゅうかい',
    'じゅっかい',
  ],
  dai: [
    '',
    'いちだい',
    'にだい',
    'さんだい',
    'よんだい',
    'ごだい',
    'ろくだい',
    'ななだい',
    'はちだい',
    'きゅうだい',
    'じゅうだい',
  ],
} as const;

export type CounterKey = keyof typeof COUNTERS;
