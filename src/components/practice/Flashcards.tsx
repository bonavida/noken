import { useState } from 'react';
import { FuriganaText } from '@/components/FuriganaText';
import { cn } from '@/utils/cn';
import { epochDay, readJson, shuffle, writeJson } from '@/utils/practice';

export interface FlashCard {
  id: string;
  // Japanese side in furigana notation (a bare kanji for the kanji deck)
  jp: string;
  es: string;
  // Reading shown with the answer (kana, or on/kun readings)
  sub?: string;
}

export interface Deck {
  id: string;
  name: string;
  cards: FlashCard[];
}

export interface FlashcardsLabels {
  decks: string;
  direction: string;
  jpToEs: string;
  esToJp: string;
  due: string;
  flip: string;
  known: string;
  unknown: string;
  done: string;
  empty: string;
  back: string;
  remaining: string;
  start: string;
}

interface FlashcardsProps {
  decks: Deck[];
  labels: FlashcardsLabels;
}

// Leitner state per card: [box 1-3, day it becomes due again]
type CardState = [number, number];
type Store = Record<string, Record<string, CardState>>;

const STORAGE_KEY = 'noken-flashcards';
const SESSION_SIZE = 20;
// Days until a card returns after a correct answer, indexed by its new box
const INTERVALS = [1, 3, 7];

const dueCards = (deck: Deck, store: Store) => {
  const today = epochDay();
  const states = store[deck.id] ?? {};
  return deck.cards.filter((card) => {
    const state = states[card.id];
    return !state || state[1] <= today;
  });
};

export const Flashcards = ({ decks, labels }: FlashcardsProps) => {
  const [store, setStore] = useState<Store>(() =>
    typeof window === 'undefined' ? {} : readJson<Store>(STORAGE_KEY, {})
  );
  const [direction, setDirection] = useState<'jp-es' | 'es-jp'>('jp-es');
  const [deck, setDeck] = useState<Deck | null>(null);
  const [queue, setQueue] = useState<FlashCard[]>([]);
  const [flipped, setFlipped] = useState(false);

  const start = (selected: Deck) => {
    setDeck(selected);
    setQueue(shuffle(dueCards(selected, store)).slice(0, SESSION_SIZE));
    setFlipped(false);
  };

  const grade = (known: boolean) => {
    const card = queue[0];
    if (!deck || !card) return;

    const states = { ...(store[deck.id] ?? {}) };
    const box = states[card.id]?.[0] ?? 1;
    const newBox = known ? Math.min(box + 1, 3) : 1;
    states[card.id] = [newBox, epochDay() + (known ? INTERVALS[newBox - 1]! : 0)];

    const nextStore = { ...store, [deck.id]: states };
    setStore(nextStore);
    writeJson(STORAGE_KEY, nextStore);

    // Missed cards come back at the end of the same session
    setQueue((current) => (known ? current.slice(1) : [...current.slice(1), card]));
    setFlipped(false);
  };

  if (!deck) {
    return (
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold">{labels.decks}</h2>
          <div className="bg-muted inline-flex rounded-lg p-1 text-sm">
            {(
              [
                ['jp-es', labels.jpToEs],
                ['es-jp', labels.esToJp],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setDirection(value)}
                aria-pressed={direction === value}
                className={cn(
                  'rounded-md px-3 py-1.5 font-medium transition-colors',
                  direction === value ? 'bg-background shadow-sm' : 'text-muted-foreground'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {decks.map((entry) => {
            const due = dueCards(entry, store).length;
            return (
              <button
                key={entry.id}
                type="button"
                onClick={() => start(entry)}
                className="bg-card hover:border-primary/40 hover:bg-accent/40 rounded-lg border p-4 text-left transition-colors"
              >
                <p className="font-semibold">{entry.name}</p>
                <p className="text-muted-foreground mt-1 text-sm">
                  <span className={cn(due > 0 && 'text-primary font-medium')}>
                    {due} {labels.due}
                  </span>{' '}
                  · {entry.cards.length}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const card = queue[0];

  if (!card) {
    const anyDue = dueCards(deck, store).length > 0;
    return (
      <div className="bg-card rounded-lg border p-6 text-center">
        <p className="text-lg font-semibold">{anyDue ? labels.done : labels.empty}</p>
        <button
          type="button"
          onClick={() => setDeck(null)}
          className="bg-secondary text-secondary-foreground hover:bg-secondary/80 mt-5 rounded-md px-5 py-2.5 text-sm font-medium transition-colors"
        >
          {labels.back}
        </button>
      </div>
    );
  }

  const front = direction === 'jp-es' ? 'jp' : 'es';

  return (
    <div>
      <div className="text-muted-foreground flex items-center justify-between text-sm">
        <button type="button" onClick={() => setDeck(null)} className="hover:text-foreground">
          ← {labels.back}
        </button>
        <p aria-live="polite">
          {queue.length} {labels.remaining}
        </p>
      </div>

      <div className="bg-card mt-4 flex min-h-64 flex-col items-center justify-center rounded-lg border p-8 text-center">
        {front === 'jp' ? (
          <p className="text-4xl leading-relaxed">
            <FuriganaText text={card.jp} />
          </p>
        ) : (
          <p className="text-2xl">{card.es}</p>
        )}

        {flipped && (
          <div className="border-border mt-6 border-t pt-6" aria-live="polite">
            {front === 'jp' ? (
              <p className="translation text-xl">{card.es}</p>
            ) : (
              <p className="text-3xl leading-relaxed">
                <FuriganaText text={card.jp} />
              </p>
            )}
            {card.sub && (
              <p className="jp text-muted-foreground mt-2 text-base" lang="ja">
                {card.sub}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 flex justify-center gap-3">
        {flipped ? (
          <>
            <button
              type="button"
              onClick={() => grade(true)}
              className="bg-verb-3/10 text-verb-3 hover:bg-verb-3/20 rounded-md px-6 py-2.5 text-sm font-medium transition-colors"
            >
              ✓ {labels.known}
            </button>
            <button
              type="button"
              onClick={() => grade(false)}
              className="bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-md px-6 py-2.5 text-sm font-medium transition-colors"
            >
              ✗ {labels.unknown}
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setFlipped(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-8 py-2.5 text-sm font-medium transition-colors"
          >
            {labels.flip}
          </button>
        )}
      </div>
    </div>
  );
};
