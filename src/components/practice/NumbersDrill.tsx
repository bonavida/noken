import { useState } from 'react';
import {
  RevealDrill,
  type DrillItem,
  type RevealDrillLabels,
} from '@/components/practice/RevealDrill';
import { ToggleGroup, ToggleGroupItem } from '@/ui/react/toggle-group';
import {
  COUNTERS,
  numberToKana,
  priceToKana,
  timeToKana,
  type CounterKey,
} from '@/utils/japaneseNumbers';
import { randomInt, randomItem } from '@/utils/practice';

type Mode = 'numbers' | 'prices' | 'hours' | 'counters';

interface NumbersDrillProps {
  labels: RevealDrillLabels & {
    reading: string;
    modeNames: Record<Mode, string>;
    counterNames: Record<CounterKey, string>;
  };
}

const MODES: Mode[] = ['numbers', 'prices', 'hours', 'counters'];
const MINUTE_CHOICES = [0, 5, 10, 15, 20, 30, 40, 45, 50];
const COUNTER_SUFFIX: Record<CounterKey, string> = {
  nin: '〜人',
  tsu: '〜つ',
  mai: '〜枚',
  hon: '〜本',
  kai: '〜回',
  dai: '〜台',
};

const randomNumber = () => {
  const tier = Math.random();
  if (tier < 0.3) return randomInt(1, 99);
  if (tier < 0.7) return randomInt(100, 9999);
  return randomInt(10000, 99999);
};

export const NumbersDrill = ({ labels }: NumbersDrillProps) => {
  const [mode, setMode] = useState<Mode>('numbers');

  const next = (): DrillItem => {
    if (mode === 'numbers') {
      const value = randomNumber();
      return {
        prompt: value.toLocaleString('es-ES'),
        targetLabel: labels.reading,
        answer: numberToKana(value),
      };
    }
    if (mode === 'prices') {
      const value = randomInt(1, 999) * 100;
      return {
        prompt: `${value.toLocaleString('es-ES')}円`,
        promptIsJapanese: true,
        targetLabel: labels.reading,
        answer: priceToKana(value),
      };
    }
    if (mode === 'hours') {
      const hour = randomInt(1, 12);
      const minutes = randomItem(MINUTE_CHOICES);
      const [answer, alternative] = timeToKana(hour, minutes);
      return {
        prompt: `${hour}:${String(minutes).padStart(2, '0')}`,
        targetLabel: labels.reading,
        answer: answer!,
        answerSub: alternative,
      };
    }
    const counter = randomItem(Object.keys(COUNTERS) as CounterKey[]);
    const quantity = randomInt(1, 10);
    return {
      prompt: `${quantity} · ${labels.counterNames[counter]}`,
      promptSub: COUNTER_SUFFIX[counter],
      targetLabel: labels.reading,
      answer: COUNTERS[counter][quantity]!,
    };
  };

  return (
    <div>
      <ToggleGroup
        type="single"
        variant="outline"
        size="sm"
        value={mode}
        onValueChange={(value) => value && setMode(value as Mode)}
        className="flex-wrap justify-start"
      >
        {MODES.map((entry) => (
          <ToggleGroupItem key={entry} value={entry} className="whitespace-nowrap">
            {labels.modeNames[entry]}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <div className="mt-4">
        <RevealDrill key={mode} next={next} labels={labels} />
      </div>
    </div>
  );
};
