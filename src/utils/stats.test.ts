import { describe, expect, it } from 'vitest';
import { weakestLessons, type PracticeStats } from '@/utils/stats';

const stats = (modes: PracticeStats['modes']): PracticeStats => ({
  modes,
  streak: { count: 0, lastDay: 0 },
});

describe('weakestLessons', () => {
  it('adds a lesson up across every mode that asked about it', () => {
    const [weakest] = weakestLessons(
      stats({
        readings: { answered: 10, correct: 4, lessons: { 3: { answered: 10, correct: 4 } } },
        particles: { answered: 10, correct: 8, lessons: { 3: { answered: 10, correct: 8 } } },
      }),
      3
    );
    // 12 of 20 overall, not the 40% or 80% either mode shows alone
    expect(weakest).toMatchObject({ lesson: 3, accuracy: 60, answered: 20 });
  });

  it('points at the mode the lesson goes worst in', () => {
    const [weakest] = weakestLessons(
      stats({
        readings: { answered: 10, correct: 9, lessons: { 5: { answered: 10, correct: 9 } } },
        kanji: { answered: 10, correct: 2, lessons: { 5: { answered: 10, correct: 2 } } },
      }),
      3
    );
    expect(weakest?.mode).toBe('kanji');
  });

  it('ignores lessons with too few answers to judge', () => {
    const result = weakestLessons(
      stats({ readings: { answered: 2, correct: 0, lessons: { 9: { answered: 2, correct: 0 } } } }),
      3
    );
    expect(result).toEqual([]);
  });

  it('leaves out lessons that are going well', () => {
    const result = weakestLessons(
      stats({
        readings: { answered: 20, correct: 19, lessons: { 1: { answered: 20, correct: 19 } } },
      }),
      3
    );
    expect(result).toEqual([]);
  });

  it('ranks worst first and respects the limit', () => {
    const result = weakestLessons(
      stats({
        readings: {
          answered: 30,
          correct: 12,
          lessons: {
            1: { answered: 10, correct: 2 },
            2: { answered: 10, correct: 5 },
            3: { answered: 10, correct: 8 },
          },
        },
      }),
      2
    );
    expect(result.map(({ lesson }) => lesson)).toEqual([1, 2]);
    expect(result.map(({ accuracy }) => accuracy)).toEqual([20, 50]);
  });

  it('breaks ties by how much evidence there is', () => {
    const result = weakestLessons(
      stats({
        readings: {
          answered: 30,
          correct: 15,
          lessons: {
            4: { answered: 10, correct: 5 },
            7: { answered: 20, correct: 10 },
          },
        },
      }),
      2
    );
    expect(result.map(({ lesson }) => lesson)).toEqual([7, 4]);
  });

  it('returns nothing when no mode records lessons', () => {
    expect(weakestLessons(stats({ numbers: { answered: 40, correct: 10 } }), 3)).toEqual([]);
  });
});
