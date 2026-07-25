import { defineCollection, z } from 'astro:content';
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
  pattern: furiganaText,
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
  }),
});

export const collections = { lessons, vocab, kanji };
