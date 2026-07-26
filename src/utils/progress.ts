// Lesson completion state, shared by the toggle button, the lessons index and
// the practice hub. Stored per level so future levels track independently.
import { PROGRESS_STORAGE_KEY } from '@/constants/storage';
import { readJson, writeJson } from '@/utils/practice';

type Progress = Record<string, number[]>;

export const completedLessons = (level: string): number[] =>
  readJson<Progress>(PROGRESS_STORAGE_KEY, {})[level] ?? [];

export const isLessonCompleted = (level: string, lesson: number): boolean =>
  completedLessons(level).includes(lesson);

// Returns the new state: true when the lesson is now completed
export const toggleLesson = (level: string, lesson: number): boolean => {
  const progress = readJson<Progress>(PROGRESS_STORAGE_KEY, {});
  const current = progress[level] ?? [];
  const completed = !current.includes(lesson);
  progress[level] = completed
    ? [...current, lesson].sort((a, b) => a - b)
    : current.filter((entry) => entry !== lesson);
  writeJson(PROGRESS_STORAGE_KEY, progress);
  return completed;
};
