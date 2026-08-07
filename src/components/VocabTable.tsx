import { useMemo, useState } from 'react';
import { FuriganaText } from '@/components/FuriganaText';
import type { WordType } from '@/constants/wordTypes';
import { Input } from '@/ui/react/input';
import { ToggleGroup, ToggleGroupItem } from '@/ui/react/toggle-group';
import { stripFurigana } from '@/utils/furigana';

export interface VocabWord {
  id: string;
  word: string;
  kana: string;
  meaning: string;
  type: WordType;
  notes?: string;
}

interface VocabTableProps {
  words: VocabWord[];
  labels: {
    word: string;
    reading: string;
    meaning: string;
    type: string;
    filterPlaceholder: string;
    allTypes: string;
    noResults: string;
  };
  typeLabels: Record<WordType, string>;
  // Kanji that have a page of their own, so each one can be looked up
  linkableKanji?: string[];
}

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');

export const VocabTable = ({ words, labels, typeLabels, linkableKanji }: VocabTableProps) => {
  const [query, setQuery] = useState('');
  const [activeType, setActiveType] = useState('');

  const presentTypes = useMemo(() => [...new Set(words.map(({ type }) => type))], [words]);

  const filteredWords = useMemo(() => {
    const normalizedQuery = normalize(query.trim());
    return words.filter((entry) => {
      if (activeType && entry.type !== activeType) return false;
      if (!normalizedQuery) return true;
      const haystack = normalize(`${stripFurigana(entry.word)} ${entry.kana} ${entry.meaning}`);
      return haystack.includes(normalizedQuery);
    });
  }, [words, query, activeType]);

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
          value={activeType}
          onValueChange={setActiveType}
          className="flex-wrap justify-start"
        >
          {presentTypes.map((type) => (
            <ToggleGroupItem key={type} value={type} className="whitespace-nowrap">
              {typeLabels[type]}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 text-muted-foreground border-b text-left">
              <th className="px-4 py-2.5 font-medium">{labels.word}</th>
              <th className="px-4 py-2.5 font-medium">{labels.reading}</th>
              <th className="px-4 py-2.5 font-medium">{labels.meaning}</th>
              <th className="hidden px-4 py-2.5 font-medium sm:table-cell">{labels.type}</th>
            </tr>
          </thead>
          <tbody>
            {filteredWords.map((entry) => (
              <tr key={entry.id} className="border-b last:border-0">
                <td className="px-4 py-2.5 text-base">
                  <FuriganaText text={entry.word} linkKanji={linkableKanji} />
                </td>
                <td className="jp text-muted-foreground px-4 py-2.5" lang="ja">
                  {entry.kana}
                </td>
                <td className="translation px-4 py-2.5">
                  {entry.meaning}
                  {entry.notes && (
                    <span className="text-muted-foreground block text-xs">{entry.notes}</span>
                  )}
                </td>
                <td className="text-muted-foreground hidden px-4 py-2.5 text-xs sm:table-cell">
                  {typeLabels[entry.type]}
                </td>
              </tr>
            ))}
            {filteredWords.length === 0 && (
              <tr>
                <td colSpan={4} className="text-muted-foreground px-4 py-6 text-center">
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
