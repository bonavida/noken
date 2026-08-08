import type { Localized } from '@/types/content';

export interface KanaEntry {
  hiragana: string;
  katakana: string;
  romaji: string;
}

export type KanaRow = (KanaEntry | null)[];

const entry = (hiragana: string, katakana: string, romaji: string): KanaEntry => ({
  hiragana,
  katakana,
  romaji,
});

// Base syllabary, laid out as the traditional 5-column grid (null = empty cell)
export const GOJUON_ROWS: KanaRow[] = [
  [
    entry('あ', 'ア', 'a'),
    entry('い', 'イ', 'i'),
    entry('う', 'ウ', 'u'),
    entry('え', 'エ', 'e'),
    entry('お', 'オ', 'o'),
  ],
  [
    entry('か', 'カ', 'ka'),
    entry('き', 'キ', 'ki'),
    entry('く', 'ク', 'ku'),
    entry('け', 'ケ', 'ke'),
    entry('こ', 'コ', 'ko'),
  ],
  [
    entry('さ', 'サ', 'sa'),
    entry('し', 'シ', 'shi'),
    entry('す', 'ス', 'su'),
    entry('せ', 'セ', 'se'),
    entry('そ', 'ソ', 'so'),
  ],
  [
    entry('た', 'タ', 'ta'),
    entry('ち', 'チ', 'chi'),
    entry('つ', 'ツ', 'tsu'),
    entry('て', 'テ', 'te'),
    entry('と', 'ト', 'to'),
  ],
  [
    entry('な', 'ナ', 'na'),
    entry('に', 'ニ', 'ni'),
    entry('ぬ', 'ヌ', 'nu'),
    entry('ね', 'ネ', 'ne'),
    entry('の', 'ノ', 'no'),
  ],
  [
    entry('は', 'ハ', 'ha'),
    entry('ひ', 'ヒ', 'hi'),
    entry('ふ', 'フ', 'fu'),
    entry('へ', 'ヘ', 'he'),
    entry('ほ', 'ホ', 'ho'),
  ],
  [
    entry('ま', 'マ', 'ma'),
    entry('み', 'ミ', 'mi'),
    entry('む', 'ム', 'mu'),
    entry('め', 'メ', 'me'),
    entry('も', 'モ', 'mo'),
  ],
  [entry('や', 'ヤ', 'ya'), null, entry('ゆ', 'ユ', 'yu'), null, entry('よ', 'ヨ', 'yo')],
  [
    entry('ら', 'ラ', 'ra'),
    entry('り', 'リ', 'ri'),
    entry('る', 'ル', 'ru'),
    entry('れ', 'レ', 're'),
    entry('ろ', 'ロ', 'ro'),
  ],
  [entry('わ', 'ワ', 'wa'), null, null, null, entry('を', 'ヲ', 'wo')],
  [entry('ん', 'ン', 'n'), null, null, null, null],
];

// Voiced (dakuten) and semi-voiced (handakuten) rows
export const DAKUTEN_ROWS: KanaRow[] = [
  [
    entry('が', 'ガ', 'ga'),
    entry('ぎ', 'ギ', 'gi'),
    entry('ぐ', 'グ', 'gu'),
    entry('げ', 'ゲ', 'ge'),
    entry('ご', 'ゴ', 'go'),
  ],
  [
    entry('ざ', 'ザ', 'za'),
    entry('じ', 'ジ', 'ji'),
    entry('ず', 'ズ', 'zu'),
    entry('ぜ', 'ゼ', 'ze'),
    entry('ぞ', 'ゾ', 'zo'),
  ],
  [
    entry('だ', 'ダ', 'da'),
    entry('ぢ', 'ヂ', 'ji'),
    entry('づ', 'ヅ', 'zu'),
    entry('で', 'デ', 'de'),
    entry('ど', 'ド', 'do'),
  ],
  [
    entry('ば', 'バ', 'ba'),
    entry('び', 'ビ', 'bi'),
    entry('ぶ', 'ブ', 'bu'),
    entry('べ', 'ベ', 'be'),
    entry('ぼ', 'ボ', 'bo'),
  ],
  [
    entry('ぱ', 'パ', 'pa'),
    entry('ぴ', 'ピ', 'pi'),
    entry('ぷ', 'プ', 'pu'),
    entry('ぺ', 'ペ', 'pe'),
    entry('ぽ', 'ポ', 'po'),
  ],
];

// Contracted sounds (yōon), 3 columns: ya / yu / yo
export const YOON_ROWS: KanaRow[] = [
  [entry('きゃ', 'キャ', 'kya'), entry('きゅ', 'キュ', 'kyu'), entry('きょ', 'キョ', 'kyo')],
  [entry('しゃ', 'シャ', 'sha'), entry('しゅ', 'シュ', 'shu'), entry('しょ', 'ショ', 'sho')],
  [entry('ちゃ', 'チャ', 'cha'), entry('ちゅ', 'チュ', 'chu'), entry('ちょ', 'チョ', 'cho')],
  [entry('にゃ', 'ニャ', 'nya'), entry('にゅ', 'ニュ', 'nyu'), entry('にょ', 'ニョ', 'nyo')],
  [entry('ひゃ', 'ヒャ', 'hya'), entry('ひゅ', 'ヒュ', 'hyu'), entry('ひょ', 'ヒョ', 'hyo')],
  [entry('みゃ', 'ミャ', 'mya'), entry('みゅ', 'ミュ', 'myu'), entry('みょ', 'ミョ', 'myo')],
  [entry('りゃ', 'リャ', 'rya'), entry('りゅ', 'リュ', 'ryu'), entry('りょ', 'リョ', 'ryo')],
  [entry('ぎゃ', 'ギャ', 'gya'), entry('ぎゅ', 'ギュ', 'gyu'), entry('ぎょ', 'ギョ', 'gyo')],
  [entry('じゃ', 'ジャ', 'ja'), entry('じゅ', 'ジュ', 'ju'), entry('じょ', 'ジョ', 'jo')],
  [entry('びゃ', 'ビャ', 'bya'), entry('びゅ', 'ビュ', 'byu'), entry('びょ', 'ビョ', 'byo')],
  [entry('ぴゃ', 'ピャ', 'pya'), entry('ぴゅ', 'ピュ', 'pyu'), entry('ぴょ', 'ピョ', 'pyo')],
];

// Writing marks that change how neighbouring kana are read, so they have no
// place in the syllabary grids above. Explanations are content, hence localized.
export interface KanaMarkExample {
  // Furigana bracket notation; katakana words carry no reading
  word: string;
  romaji: string;
  meaning: Localized;
}

export interface KanaMark {
  id: string;
  symbol: string;
  name: Localized;
  effect: Localized;
  examples: KanaMarkExample[];
}

export const KANA_MARKS: KanaMark[] = [
  {
    id: 'sokuon',
    symbol: 'っ ッ',
    name: { es: 'Sokuon — つ pequeña', en: 'Sokuon — the small つ' },
    effect: {
      es: 'Una つ escrita en pequeño no se pronuncia: duplica la consonante siguiente y marca una pausa breve, como en «gato» frente a «gatto». Nunca aparece al final de una palabra.',
      en: 'A つ written small is not pronounced: it doubles the following consonant and marks a short pause, like the difference between "kite" and "kitte". It never appears at the end of a word.',
    },
    examples: [
      { word: '切手[きって]', romaji: 'kitte', meaning: { es: 'sello', en: 'stamp' } },
      { word: '学校[がっこう]', romaji: 'gakkō', meaning: { es: 'escuela', en: 'school' } },
      { word: '雑誌[ざっし]', romaji: 'zasshi', meaning: { es: 'revista', en: 'magazine' } },
    ],
  },
  {
    id: 'chouonpu',
    symbol: 'ー',
    name: { es: 'Chōonpu — raya de alargamiento', en: 'Chōonpu — the lengthening mark' },
    effect: {
      es: 'Alarga la vocal anterior durante otro tiempo. Se usa solo en katakana, sobre todo en préstamos de otros idiomas, y se escribe horizontal aunque el texto sea vertical.',
      en: 'It holds the preceding vowel for one extra beat. It is used only in katakana, mostly in loanwords, and is written horizontally even in vertical text.',
    },
    examples: [
      { word: 'コーヒー', romaji: 'kōhī', meaning: { es: 'café', en: 'coffee' } },
      { word: 'スーパー', romaji: 'sūpā', meaning: { es: 'supermercado', en: 'supermarket' } },
      { word: 'タクシー', romaji: 'takushī', meaning: { es: 'taxi', en: 'taxi' } },
    ],
  },
  {
    id: 'long-vowels',
    symbol: 'おう えい',
    name: { es: 'Vocales largas en hiragana', en: 'Long vowels in hiragana' },
    effect: {
      es: 'El hiragana no usa ー: la vocal se alarga añadiendo otra vocal. お se alarga casi siempre con う (y a veces con お), y え con い.',
      en: 'Hiragana does not use ー: a vowel is lengthened by adding another vowel. お is almost always lengthened with う (and sometimes with お), and え with い.',
    },
    examples: [
      { word: '高校[こうこう]', romaji: 'kōkō', meaning: { es: 'instituto', en: 'high school' } },
      { word: '先生[せんせい]', romaji: 'sensei', meaning: { es: 'profesor', en: 'teacher' } },
      { word: '大[おお]きい', romaji: 'ōkii', meaning: { es: 'grande', en: 'big' } },
    ],
  },
];
