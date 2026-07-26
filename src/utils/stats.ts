// Lifetime practice aggregates: per-mode answer counts and a daily streak.
// Every quiz answer, drill self-grade and flashcard grade lands here, so the
// practice hub can show accumulated stats across sessions.
import { PRACTICE_STATS_STORAGE_KEY } from '@/constants/storage';
import { epochDay, readJson, writeJson } from '@/utils/practice';

export type PracticeMode = 'readings' | 'particles' | 'conjugation' | 'flashcards' | 'numbers';

interface ModeStats {
  answered: number;
  correct: number;
}

export interface PracticeStats {
  modes: Partial<Record<PracticeMode, ModeStats>>;
  streak: { count: number; lastDay: number };
}

const EMPTY: PracticeStats = { modes: {}, streak: { count: 0, lastDay: 0 } };

export const readStats = (): PracticeStats => readJson(PRACTICE_STATS_STORAGE_KEY, EMPTY);

// The streak survives until a full calendar day goes by without practicing
export const currentStreak = ({ streak }: PracticeStats): number =>
  streak.lastDay >= epochDay() - 1 ? streak.count : 0;

export const recordAnswer = (mode: PracticeMode, correct: boolean) => {
  const stats = readStats();
  const today = epochDay();
  const entry = stats.modes[mode] ?? { answered: 0, correct: 0 };
  const streakCount =
    stats.streak.lastDay === today ? stats.streak.count : currentStreak(stats) + 1;

  writeJson(PRACTICE_STATS_STORAGE_KEY, {
    modes: {
      ...stats.modes,
      [mode]: { answered: entry.answered + 1, correct: entry.correct + (correct ? 1 : 0) },
    },
    streak: { count: streakCount, lastDay: today },
  });
};
