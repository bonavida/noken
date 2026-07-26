import { useMemo, useState } from 'react';
import { FuriganaText } from '@/components/FuriganaText';
import { cn } from '@/utils/cn';
import { sample, shuffle } from '@/utils/practice';
import { recordAnswer, type PracticeMode } from '@/utils/stats';

export interface McQuestion {
  id: string;
  // Furigana bracket notation; may contain ＿＿＿ as the blank in cloze questions
  prompt: string;
  // Spanish context shown under the prompt (e.g. the word's meaning)
  context?: string;
  options: string[];
  answer: string;
  // Shown after answering, in furigana notation (e.g. the full sentence)
  explanationJp?: string;
  // Shown after answering, in Spanish (e.g. the translation)
  explanationEs?: string;
  lesson?: number;
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

const buildRound = (questions: McQuestion[], lessonFilter: string, count: number) => {
  const pool =
    lessonFilter === 'all'
      ? questions
      : questions.filter((question) => question.lesson === Number(lessonFilter));
  return sample(pool, Math.min(count, pool.length)).map((question) => ({
    ...question,
    options: shuffle(question.options),
  }));
};

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

  const [lessonFilter, setLessonFilter] = useState('all');
  const [round, setRound] = useState(() => buildRound(questions, 'all', questionCount));
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
    setSelected(option);
    if (option === question.answer) setScore((current) => current + 1);
    if (statsKey) recordAnswer(statsKey, option === question.answer);
  };

  const advance = () => {
    if (index + 1 >= round.length) {
      setFinished(true);
      return;
    }
    setIndex((current) => current + 1);
    setSelected(null);
  };

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
            {lessons.map((lesson) => (
              <option key={lesson} value={lesson}>
                {labels.lesson} {lesson}
              </option>
            ))}
          </select>
        </label>
        <p className="text-muted-foreground text-sm" aria-live="polite">
          {labels.question} {index + 1} {labels.of} {round.length} · {labels.score}: {score}
        </p>
      </div>

      <div className="bg-card mt-4 rounded-lg border p-6">
        <p className="text-2xl leading-relaxed sm:text-3xl">
          <FuriganaText text={question.prompt} />
        </p>
        {question.context && (
          <p className="text-muted-foreground mt-2 text-sm">{question.context}</p>
        )}

        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          {question.options.map((option) => {
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
