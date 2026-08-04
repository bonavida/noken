import { useState } from 'react';
import { McQuiz, type McQuestion, type McQuizLabels } from '@/components/practice/McQuiz';
import { ToggleGroup, ToggleGroupItem } from '@/ui/react/toggle-group';

type Direction = 'toKanji' | 'toMeaning';

interface KanjiQuizProps {
  // Same kanji asked both ways, so the round can be flipped without a reload
  toKanji: McQuestion[];
  toMeaning: McQuestion[];
  labels: McQuizLabels & {
    direction: string;
    toKanji: string;
    toMeaning: string;
  };
}

export const KanjiQuiz = ({ toKanji, toMeaning, labels }: KanjiQuizProps) => {
  const [direction, setDirection] = useState<Direction>('toKanji');

  return (
    <div>
      <ToggleGroup
        type="single"
        variant="outline"
        size="sm"
        value={direction}
        onValueChange={(value) => value && setDirection(value as Direction)}
        className="flex-wrap justify-start"
        aria-label={labels.direction}
      >
        <ToggleGroupItem value="toKanji" className="whitespace-nowrap">
          {labels.toKanji}
        </ToggleGroupItem>
        <ToggleGroupItem value="toMeaning" className="whitespace-nowrap">
          {labels.toMeaning}
        </ToggleGroupItem>
      </ToggleGroup>

      <div className="mt-4">
        {/* Remounting starts a fresh round when the direction changes */}
        <McQuiz
          key={direction}
          questions={direction === 'toKanji' ? toKanji : toMeaning}
          labels={labels}
          optionsAreJapanese={direction === 'toKanji'}
          statsKey="kanji"
        />
      </div>
    </div>
  );
};
