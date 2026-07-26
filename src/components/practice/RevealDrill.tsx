import { useState } from 'react';
import { FuriganaText } from '@/components/FuriganaText';
import { cn } from '@/utils/cn';
import { recordAnswer, type PracticeMode } from '@/utils/stats';

export interface DrillItem {
  // What the learner sees; furigana notation for Japanese, plain text otherwise
  prompt: string;
  promptIsJapanese?: boolean;
  // Small line under the prompt (meaning, counter hint…)
  promptSub?: string;
  // Which form/reading is being asked for
  targetLabel: string;
  answer: string;
  // Alternative or extra reading shown under the answer
  answerSub?: string;
}

export interface RevealDrillLabels {
  reveal: string;
  right: string;
  wrong: string;
  session: string;
}

interface RevealDrillProps {
  next: () => DrillItem;
  labels: RevealDrillLabels;
  // When set, every self-grade feeds the lifetime stats shown on the practice hub
  statsKey?: PracticeMode;
}

// Think → reveal → self-grade. The produce-then-check loop beats multiple
// choice for recall, so this shell powers the conjugation and number drills.
export const RevealDrill = ({ next, labels, statsKey }: RevealDrillProps) => {
  const [item, setItem] = useState<DrillItem>(next);
  const [revealed, setRevealed] = useState(false);
  const [stats, setStats] = useState({ right: 0, wrong: 0 });

  const grade = (correct: boolean) => {
    setStats(({ right, wrong }) => ({
      right: right + (correct ? 1 : 0),
      wrong: wrong + (correct ? 0 : 1),
    }));
    if (statsKey) recordAnswer(statsKey, correct);
    setItem(next());
    setRevealed(false);
  };

  return (
    <div className="bg-card rounded-lg border p-6">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-primary text-sm font-medium">{item.targetLabel}</p>
        <p className="text-muted-foreground text-sm" aria-live="polite">
          {labels.session}: <span className="text-verb-3">{stats.right}</span> ·{' '}
          <span className="text-destructive">{stats.wrong}</span>
        </p>
      </div>

      <p
        className={cn('mt-4 text-3xl leading-relaxed', item.promptIsJapanese && 'jp')}
        lang={item.promptIsJapanese ? 'ja' : undefined}
      >
        {item.promptIsJapanese ? <FuriganaText text={item.prompt} /> : item.prompt}
      </p>
      {item.promptSub && <p className="text-muted-foreground mt-1 text-sm">{item.promptSub}</p>}

      <div className="mt-6 min-h-20" aria-live="polite">
        {revealed ? (
          <>
            <p className="jp text-2xl" lang="ja">
              {item.answer}
            </p>
            {item.answerSub && (
              <p className="jp text-muted-foreground mt-1 text-base" lang="ja">
                {item.answerSub}
              </p>
            )}
          </>
        ) : (
          <p className="text-muted-foreground text-sm italic">…</p>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        {revealed ? (
          <>
            <button
              type="button"
              onClick={() => grade(true)}
              className="bg-verb-3/10 text-verb-3 hover:bg-verb-3/20 rounded-md px-5 py-2.5 text-sm font-medium transition-colors"
            >
              ✓ {labels.right}
            </button>
            <button
              type="button"
              onClick={() => grade(false)}
              className="bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-md px-5 py-2.5 text-sm font-medium transition-colors"
            >
              ✗ {labels.wrong}
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-5 py-2.5 text-sm font-medium transition-colors"
          >
            {labels.reveal}
          </button>
        )}
      </div>
    </div>
  );
};
