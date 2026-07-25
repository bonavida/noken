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
