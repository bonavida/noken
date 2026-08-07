// Lifetime practice aggregates: per-mode answer counts and a daily streak.
// Every quiz answer, drill self-grade and flashcard grade lands here, so the
// practice hub can show accumulated stats across sessions.
import { PRACTICE_STATS_STORAGE_KEY } from '@/constants/storage';
import { epochDay, readJson, writeJson } from '@/utils/practice';

export type PracticeMode =
  'readings' | 'kanji' | 'particles' | 'conjugation' | 'flashcards' | 'numbers';

export interface AnswerCount {
  answered: number;
  correct: number;
}

interface ModeStats extends AnswerCount {
  // Per-lesson breakdown, only for modes whose questions carry a lesson number
  lessons?: Record<string, AnswerCount>;
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

export const lessonStats = (mode: PracticeMode): Record<string, AnswerCount> =>
  readStats().modes[mode]?.lessons ?? {};

const bump = (entry: AnswerCount | undefined, correct: boolean): AnswerCount => ({
  answered: (entry?.answered ?? 0) + 1,
  correct: (entry?.correct ?? 0) + (correct ? 1 : 0),
});

export const recordAnswer = (mode: PracticeMode, correct: boolean, lesson?: number) => {
  const stats = readStats();
  const today = epochDay();
  const entry = stats.modes[mode];
  const streakCount =
    stats.streak.lastDay === today ? stats.streak.count : currentStreak(stats) + 1;
  const lessons =
    lesson == null
      ? entry?.lessons
      : { ...entry?.lessons, [lesson]: bump(entry?.lessons?.[lesson], correct) };

  writeJson(PRACTICE_STATS_STORAGE_KEY, {
    modes: {
      ...stats.modes,
      [mode]: { ...bump(entry, correct), ...(lessons && { lessons }) },
    },
    streak: { count: streakCount, lastDay: today },
  });
};

export interface WeakLesson {
  lesson: number;
  // Accuracy across every mode that asked about this lesson, 0-100
  accuracy: number;
  answered: number;
  // The mode this lesson goes worst in, so the review link drills that one
  mode: PracticeMode;
}

// A lesson needs a few answers before one bad guess can brand it weak, and
// anything above the ceiling does not need reviewing at all.
const MIN_ANSWERS = 5;
const MAX_ACCURACY = 85;

export const weakestLessons = (
  stats: PracticeStats,
  limit: number,
  { minAnswers = MIN_ANSWERS, maxAccuracy = MAX_ACCURACY } = {}
): WeakLesson[] => {
  const totals = new Map<
    number,
    AnswerCount & { worstMode: PracticeMode; worstAccuracy: number }
  >();

  Object.entries(stats.modes).forEach(([mode, modeStats]) => {
    Object.entries(modeStats?.lessons ?? {}).forEach(([key, count]) => {
      if (count.answered === 0) return;
      const lesson = Number(key);
      const accuracy = count.correct / count.answered;
      const current = totals.get(lesson);
      const worse = !current || accuracy < current.worstAccuracy;

      totals.set(lesson, {
        answered: (current?.answered ?? 0) + count.answered,
        correct: (current?.correct ?? 0) + count.correct,
        worstMode: worse ? (mode as PracticeMode) : current.worstMode,
        worstAccuracy: worse ? accuracy : current.worstAccuracy,
      });
    });
  });

  return (
    [...totals.entries()]
      .filter(([, total]) => total.answered >= minAnswers)
      .map(([lesson, total]) => ({
        lesson,
        accuracy: Math.round((total.correct / total.answered) * 100),
        answered: total.answered,
        mode: total.worstMode,
      }))
      .filter(({ accuracy }) => accuracy <= maxAccuracy)
      // Worst first; a tie goes to whichever has been answered more often
      .sort((a, b) => a.accuracy - b.accuracy || b.answered - a.answered)
      .slice(0, limit)
  );
};
