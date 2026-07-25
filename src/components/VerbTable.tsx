import { useMemo, useState } from 'react';
import { FuriganaText } from '@/components/FuriganaText';
import { Input } from '@/ui/react/input';
import { ToggleGroup, ToggleGroupItem } from '@/ui/react/toggle-group';
import { stripFurigana } from '@/utils/furigana';

export interface Verb {
  id: string;
  group: 1 | 2 | 3;
  verb: string;
  masu: string;
  te: string;
  dictionary: string;
  nai?: string;
  ta: string;
  meaning: string;
  lesson: number;
}

interface VerbTableProps {
  verbs: Verb[];
  labels: {
    verb: string;
    masu: string;
    te: string;
    dictionary: string;
    nai: string;
    ta: string;
    meaning: string;
    lesson: string;
    group: string;
    allGroups: string;
    filterPlaceholder: string;
    noResults: string;
    resultCount: string;
  };
  groupLabels: Record<string, string>;
}

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');

const GROUPS = ['1', '2', '3'] as const;

export const VerbTable = ({ verbs, labels, groupLabels }: VerbTableProps) => {
  const [query, setQuery] = useState('');
  const [activeGroup, setActiveGroup] = useState('');

  const filteredVerbs = useMemo(() => {
    const normalizedQuery = normalize(query.trim());
    return verbs.filter((entry) => {
      if (activeGroup && String(entry.group) !== activeGroup) return false;
      if (!normalizedQuery) return true;
      const haystack = normalize(
        `${stripFurigana(entry.verb)} ${entry.masu} ${entry.dictionary} ${entry.meaning}`
      );
      return haystack.includes(normalizedQuery);
    });
  }, [verbs, query, activeGroup]);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={labels.filterPlaceholder}
          className="sm:max-w-xs"
          aria-label={labels.filterPlaceholder}
        />
        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          value={activeGroup}
          onValueChange={setActiveGroup}
          className="flex-wrap justify-start"
        >
          {GROUPS.map((group) => (
            <ToggleGroupItem key={group} value={group} className="whitespace-nowrap">
              {groupLabels[group]}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <p className="text-muted-foreground mt-3 text-sm" aria-live="polite">
        {filteredVerbs.length} {labels.resultCount}
      </p>

      <div className="mt-3 overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 text-muted-foreground border-b text-left">
              <th className="px-3 py-2.5 font-medium">{labels.verb}</th>
              <th className="px-3 py-2.5 font-medium">{labels.masu}</th>
              <th className="px-3 py-2.5 font-medium">{labels.te}</th>
              <th className="px-3 py-2.5 font-medium">{labels.dictionary}</th>
              <th className="px-3 py-2.5 font-medium">{labels.nai}</th>
              <th className="px-3 py-2.5 font-medium">{labels.ta}</th>
              <th className="px-3 py-2.5 font-medium">{labels.meaning}</th>
              <th className="px-3 py-2.5 text-right font-medium">{labels.lesson}</th>
            </tr>
          </thead>
          <tbody className="jp" lang="ja">
            {filteredVerbs.map((entry) => (
              <tr key={entry.id} className="border-b last:border-0">
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <FuriganaText text={entry.verb} />
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap">{entry.masu}</td>
                <td className="px-3 py-2.5 whitespace-nowrap">{entry.te}</td>
                <td className="text-primary px-3 py-2.5 whitespace-nowrap">{entry.dictionary}</td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  {entry.nai ?? <span className="text-muted-foreground">—</span>}
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap">{entry.ta}</td>
                <td className="translation px-3 py-2.5 font-sans">{entry.meaning}</td>
                <td className="text-muted-foreground px-3 py-2.5 text-right font-sans">
                  {entry.lesson}
                </td>
              </tr>
            ))}
            {filteredVerbs.length === 0 && (
              <tr>
                <td colSpan={8} className="text-muted-foreground px-3 py-6 text-center font-sans">
                  {labels.noResults}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
