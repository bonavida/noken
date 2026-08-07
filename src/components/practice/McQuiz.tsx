import { useMemo, useState } from 'react';
import { FuriganaText } from '@/components/FuriganaText';
import { useQuizKeys } from '@/hooks/useQuizKeys';
import { cn } from '@/utils/cn';
import { recordHit, recordMiss } from '@/utils/difficult';
import { sample, shuffle } from '@/utils/practice';
import { lessonStats, recordAnswer, type AnswerCount, type PracticeMode } from '@/utils/stats';

export interface McQuestion {
  id: string;
  // Furigana bracket notation; may contain ＿＿＿ as the blank in cloze questions
  prompt: string;
  // Spanish prompts (a meaning to match against kanji) are not Japanese text
  promptIsSpanish?: boolean;
  // Spanish context shown under the prompt (e.g. the word's meaning)
  context?: string;
  options: string[];
  answer: string;
  // Shown after answering, in furigana notation (e.g. the full sentence)
  explanationJp?: string;
  // Shown after answering, in Spanish (e.g. the translation)
  explanationEs?: string;
  lesson?: number;
  // `deckId:cardId` linking this question to a flashcard, so misses feed the
  // difficult-words deck and hits work them back off it
  cardKey?: string;
}

export interface McQuizLabels {
  question: string;
  of: string;
  score: string;
  next: string;
  finish: string;
  restart: string;
  correct: string;
  incorrect: string;
  result: string;
  allLessons: string;
  lessonFilter: string;
  lesson: string;
  ranges: string;
  lessons: string;
}

interface McQuizProps {
  questions: McQuestion[];
  labels: McQuizLabels;
  // Options render in the JP font when they are Japanese (readings, particles)
  optionsAreJapanese?: boolean;
  questionCount?: number;
  // When set, every answer feeds the lifetime stats shown on the practice hub
  statsKey?: PracticeMode;
}

// Filter values are "all", a single lesson ("7") or a block ("range:6-10")
const matchesFilter = (question: McQuestion, filter: string) => {
  if (filter === 'all') return true;
  if (question.lesson == null) return false;
  if (!filter.startsWith('range:')) return question.lesson === Number(filter);
  const [start, end] = filter.slice('range:'.length).split('-').map(Number);
  return question.lesson >= (start ?? 0) && question.lesson <= (end ?? 0);
};

const buildRound = (questions: McQuestion[], lessonFilter: string, count: number) => {
  const pool = questions.filter((question) => matchesFilter(question, lessonFilter));
  return sample(pool, Math.min(count, pool.length)).map((question) => ({
    ...question,
    options: shuffle(question.options),
  }));
};

// Revision happens in blocks of lessons, not one at a time
const RANGE_SIZE = 5;

export const McQuiz = ({
  questions,
  labels,
  optionsAreJapanese = true,
  questionCount = 10,
  statsKey,
}: McQuizProps) => {
  const lessons = useMemo(
    () =>
      [...new Set(questions.map(({ lesson }) => lesson).filter((n) => n != null))].sort(
        (a, b) => a - b
      ),
    [questions]
  );

  // Blocks of five that actually contain questions
  const ranges = useMemo(() => {
    const max = lessons.length > 0 ? Math.max(...lessons) : 0;
    return Array.from({ length: Math.ceil(max / RANGE_SIZE) }, (_, index) => {
      const start = index * RANGE_SIZE + 1;
      return { start, end: Math.min(start + RANGE_SIZE - 1, max) };
    }).filter(({ start, end }) => lessons.some((lesson) => lesson >= start && lesson <= end));
  }, [lessons]);

  // The review panel links here with the lesson already chosen; an unknown or
  // empty scope falls back to everything rather than an empty round
  const initialFilter = () => {
    if (typeof window === 'undefined') return 'all';
    const requested = new URLSearchParams(window.location.search).get('lesson');
    if (!requested) return 'all';
    return questions.some((question) => matchesFilter(question, requested)) ? requested : 'all';
  };

  const [lessonFilter, setLessonFilter] = useState(initialFilter);
  const [byLesson, setByLesson] = useState<Record<string, AnswerCount>>(() =>
    typeof window === 'undefined' || !statsKey ? {} : lessonStats(statsKey)
  );
  const [round, setRound] = useState(() => buildRound(questions, initialFilter(), questionCount));
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const restart = (filter: string) => {
    setRound(buildRound(questions, filter, questionCount));
    setIndex(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
  };

  const changeLesson = (value: string) => {
    setLessonFilter(value);
    restart(value);
  };

  const question = round[index];

  const choose = (option: string) => {
    if (selected !== null || !question) return;
    const correct = option === question.answer;
    setSelected(option);
    if (correct) setScore((current) => current + 1);
    if (correct) recordHit(question.cardKey);
    if (!correct) recordMiss(question.cardKey);
    if (!statsKey) return;
    recordAnswer(statsKey, correct, question.lesson);
    setByLesson(lessonStats(statsKey));
  };

  // Historical accuracy shown next to each option in the filter, so the weakest
  // lessons and blocks are visible at the moment you choose what to drill
  const accuracySuffix = (...lessonNumbers: number[]) => {
    const counted = lessonNumbers
      .map((lesson) => byLesson[lesson])
      .filter((entry): entry is AnswerCount => Boolean(entry?.answered));
    if (counted.length === 0) return '';
    const answered = counted.reduce((total, entry) => total + entry.answered, 0);
    const correct = counted.reduce((total, entry) => total + entry.correct, 0);
    return ` · ${Math.round((correct / answered) * 100)}%`;
  };

  const lessonsIn = (start: number, end: number) =>
    lessons.filter((lesson) => lesson >= start && lesson <= end);

  const advance = () => {
    if (index + 1 >= round.length) {
      setFinished(true);
      return;
    }
    setIndex((current) => current + 1);
    setSelected(null);
  };

  // 1-4 answer, space or enter moves on once the result is showing
  useQuizKeys({
    ...Object.fromEntries(
      (question?.options ?? []).map((option, index) => [
        String(index + 1),
        selected === null ? () => choose(option) : undefined,
      ])
    ),
    ' ': selected === null ? undefined : advance,
    Enter: selected === null ? undefined : advance,
  });

  if (finished || !question) {
    return (
      <div className="bg-card rounded-lg border p-6 text-center">
        <p className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
          {labels.result}
        </p>
        <p className="mt-3 text-4xl font-bold">
          {score} / {round.length}
        </p>
        <button
          type="button"
          onClick={() => restart(lessonFilter)}
          className="bg-primary text-primary-foreground hover:bg-primary/90 mt-6 rounded-md px-5 py-2.5 text-sm font-medium transition-colors"
        >
          {labels.restart}
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="text-muted-foreground flex items-center gap-2 text-sm">
          {labels.lessonFilter}
          <select
            value={lessonFilter}
            onChange={(event) => changeLesson(event.target.value)}
            className="border-input bg-background focus-visible:ring-ring rounded-md border px-2 py-1.5 text-sm focus-visible:ring-2 focus-visible:outline-none"
          >
            <option value="all">{labels.allLessons}</option>
            {ranges.length > 1 && (
              <optgroup label={labels.ranges}>
                {ranges.map(({ start, end }) => (
                  <option key={`range-${start}`} value={`range:${start}-${end}`}>
                    {`${start}–${end}${accuracySuffix(...lessonsIn(start, end))}`}
                  </option>
                ))}
              </optgroup>
            )}
            <optgroup label={labels.lessons}>
              {lessons.map((lesson) => (
                <option key={lesson} value={lesson}>
                  {`${labels.lesson} ${lesson}${accuracySuffix(lesson)}`}
                </option>
              ))}
            </optgroup>
          </select>
        </label>
        <p className="text-muted-foreground text-sm" aria-live="polite">
          {labels.question} {index + 1} {labels.of} {round.length} · {labels.score}: {score}
        </p>
      </div>

      <div className="bg-card mt-4 rounded-lg border p-6">
        <p className="text-2xl leading-relaxed sm:text-3xl">
          {question.promptIsSpanish ? question.prompt : <FuriganaText text={question.prompt} />}
        </p>
        {question.context && (
          <p className="text-muted-foreground mt-2 text-sm">{question.context}</p>
        )}

        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          {question.options.map((option, index) => {
            const isAnswer = option === question.answer;
            const isSelected = option === selected;
            return (
              <button
                key={option}
                type="button"
                onClick={() => choose(option)}
                disabled={selected !== null}
                className={cn(
                  'rounded-md border px-4 py-3 text-left text-lg transition-colors',
                  optionsAreJapanese && 'jp',
                  selected === null && 'hover:border-primary/40 hover:bg-accent/40 cursor-pointer',
                  selected !== null && isAnswer && 'border-verb-3 bg-verb-3/10 text-verb-3',
                  selected !== null &&
                    isSelected &&
                    !isAnswer &&
                    'border-destructive bg-destructive/10 text-destructive',
                  selected !== null && !isSelected && !isAnswer && 'opacity-50'
                )}
                lang={optionsAreJapanese ? 'ja' : undefined}
              >
                <kbd
                  className="bg-muted text-muted-foreground mr-2 hidden rounded px-1.5 py-0.5 font-sans text-xs sm:inline"
                  aria-hidden="true"
                >
                  {index + 1}
                </kbd>
                {option}
              </button>
            );
          })}
        </div>

        {selected !== null && (
          <div className="bg-muted/50 mt-5 rounded-md p-4" aria-live="polite">
            <p
              className={cn(
                'text-sm font-semibold',
                selected === question.answer ? 'text-verb-3' : 'text-destructive'
              )}
            >
              {selected === question.answer ? labels.correct : labels.incorrect}
            </p>
            {question.explanationJp && (
              <p className="mt-2 text-lg">
                <FuriganaText text={question.explanationJp} />
              </p>
            )}
            {question.explanationEs && (
              <p className="text-muted-foreground mt-1 text-sm">{question.explanationEs}</p>
            )}
            <button
              type="button"
              onClick={advance}
              className="bg-primary text-primary-foreground hover:bg-primary/90 mt-4 rounded-md px-4 py-2 text-sm font-medium transition-colors"
            >
              {index + 1 >= round.length ? labels.finish : labels.next}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
