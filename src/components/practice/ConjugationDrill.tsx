import { useState } from 'react';
import {
  RevealDrill,
  type DrillItem,
  type RevealDrillLabels,
} from '@/components/practice/RevealDrill';
import { ToggleGroup, ToggleGroupItem } from '@/ui/react/toggle-group';
import { randomItem } from '@/utils/practice';

export interface DrillVerb {
  id: string;
  verb: string;
  masu: string;
  te: string;
  dictionary: string;
  nai?: string;
  ta: string;
  meaning: string;
  group: 1 | 2 | 3;
}

type FormKey = 'te' | 'dictionary' | 'nai' | 'ta';

interface ConjugationDrillProps {
  verbs: DrillVerb[];
  labels: RevealDrillLabels & {
    forms: string;
    formNames: Record<FormKey, string>;
    groupBadges: Record<string, string>;
    groupLabels: Record<string, string>;
  };
}

const FORM_KEYS: FormKey[] = ['te', 'dictionary', 'nai', 'ta'];
const GROUP_KEYS = ['1', '2', '3'];

export const ConjugationDrill = ({ verbs, labels }: ConjugationDrillProps) => {
  const [forms, setForms] = useState<string[]>([...FORM_KEYS]);
  const [groups, setGroups] = useState<string[]>([...GROUP_KEYS]);

  const activeForms = (forms.length > 0 ? forms : FORM_KEYS) as FormKey[];
  const activeGroups = groups.length > 0 ? groups : GROUP_KEYS;

  const next = (): DrillItem => {
    const pool = verbs.filter((verb) => activeGroups.includes(String(verb.group)));
    for (;;) {
      const verb = randomItem(pool);
      const form = randomItem(activeForms);
      const answer = verb[form];
      // あります has no ない-form; draw again
      if (!answer) continue;
      return {
        prompt: verb.verb,
        promptIsJapanese: true,
        promptSub: verb.meaning,
        targetLabel: labels.formNames[form],
        answer,
        cardKey: `verbs:${verb.id}`,
      };
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <ToggleGroup
          type="multiple"
          variant="outline"
          size="sm"
          value={forms}
          onValueChange={(value) => setForms(value.length > 0 ? value : forms)}
          className="flex-wrap justify-start"
          aria-label={labels.forms}
        >
          {FORM_KEYS.map((form) => (
            <ToggleGroupItem key={form} value={form} className="whitespace-nowrap">
              {labels.formNames[form]}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        <ToggleGroup
          type="multiple"
          variant="outline"
          size="sm"
          value={groups}
          onValueChange={(value) => setGroups(value.length > 0 ? value : groups)}
          className="flex-wrap justify-start"
        >
          {GROUP_KEYS.map((group) => (
            <ToggleGroupItem
              key={group}
              value={group}
              aria-label={labels.groupLabels[group]}
              className="whitespace-nowrap"
            >
              {labels.groupBadges[group]}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <div className="mt-4">
        {/* Remount when filters change so the current card follows the selection */}
        <RevealDrill
          key={`${forms.join()}-${groups.join()}`}
          next={next}
          labels={labels}
          statsKey="conjugation"
        />
      </div>
    </div>
  );
};
