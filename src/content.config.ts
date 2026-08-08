import { defineCollection } from 'astro:content';
import { z } from 'astro:schema';
import { glob } from 'astro/loaders';
import { LEVELS } from '@/constants/levels';
import { WORD_TYPES } from '@/constants/wordTypes';

// Spanish is the canonical language; other locales are additive optional keys
const localized = z.object({ es: z.string(), en: z.string().optional() });
const localizedList = z.object({
  es: z.array(z.string()),
  en: z.array(z.string()).optional(),
});

// Japanese text in furigana bracket notation, e.g. "私[わたし]は 学生[がくせい]です"
const furiganaText = z.string();

const exampleSentence = z.object({
  jp: furiganaText,
  translation: localized,
  note: localized.optional(),
});

const grammarPoint = z.object({
  id: z.string(),
  title: localized,
  // The pattern mixes Japanese with metalanguage ("lugar", "forma ます"), so it
  // is localized too even though most of the string is the same in every language
  pattern: localized,
  explanation: localized,
  examples: z.array(exampleSentence).min(1),
});

const lessons = defineCollection({
  loader: glob({ pattern: '*/lessons/*.json', base: './src/data' }),
  schema: z.object({
    level: z.enum(LEVELS),
    number: z.number().int().min(1),
    title: localized,
    jpTitle: furiganaText.optional(),
    description: localized.optional(),
    grammar: z.array(grammarPoint).min(1),
    // Reference topics worth consulting alongside this lesson: either a slug from
    // the reference collection or one of the standalone guides ('verbs', 'kana')
    references: z.array(z.string()).optional(),
  }),
});

const vocab = defineCollection({
  loader: glob({ pattern: '*/vocab/*.json', base: './src/data' }),
  schema: z.object({
    level: z.enum(LEVELS),
    lesson: z.number().int().min(1),
    words: z
      .array(
        z.object({
          id: z.string(),
          word: furiganaText,
          kana: z.string(),
          meaning: localized,
          type: z.enum(WORD_TYPES),
          notes: localized.optional(),
        })
      )
      .min(1),
  }),
});

const kanji = defineCollection({
  loader: glob({ pattern: '*/kanji/*.json', base: './src/data' }),
  schema: z.object({
    character: z.string(),
    level: z.enum(LEVELS),
    lesson: z.number().int().optional(),
    meanings: localizedList,
    onyomi: z.array(z.string()),
    kunyomi: z.array(z.string()),
    strokes: z.number().int().positive(),
    examples: z.array(z.object({ word: furiganaText, meaning: localized })),
    // Kanji the book flags as easy to mix up with this one
    similar: z.array(z.string()).optional(),
  }),
});

// Verb conjugation table (Minna no Nihongo I, appendix V)
const verbs = defineCollection({
  loader: glob({ pattern: '*/verbs/*.json', base: './src/data' }),
  schema: z.object({
    level: z.enum(LEVELS),
    verbs: z
      .array(
        z.object({
          id: z.string(),
          group: z.union([z.literal(1), z.literal(2), z.literal(3)]),
          verb: furiganaText,
          masu: z.string(),
          te: z.string(),
          dictionary: z.string(),
          // あります has no ない-form; the book prints a dash there
          nai: z.string().optional(),
          ta: z.string(),
          meaning: localized,
          lesson: z.number().int().min(1),
        })
      )
      .min(1),
  }),
});

// Reference tables: cells are either locale-neutral (Japanese, numbers) or translatable
const referenceCell = z.union([z.string(), localized]);

const reference = defineCollection({
  loader: glob({ pattern: '*/reference/*.json', base: './src/data' }),
  schema: z.object({
    level: z.enum(LEVELS),
    slug: z.string(),
    title: localized,
    description: localized,
    order: z.number().int(),
    sections: z
      .array(
        z.object({
          id: z.string(),
          title: localized,
          note: localized.optional(),
          tables: z
            .array(
              z.object({
                caption: localized.optional(),
                headers: z.array(referenceCell),
                rows: z.array(z.array(referenceCell)).min(1),
              })
            )
            .min(1),
        })
      )
      .min(1),
  }),
});

export const collections = { lessons, vocab, kanji, verbs, reference };
