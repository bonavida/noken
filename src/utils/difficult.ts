// Miss counts per study item, keyed `deckId:cardId` so the readings quiz, the
// conjugation drill and the flashcards all point at the same cards. Items with
// a positive count form the virtual "difficult" flashcard deck; each correct
// answer anywhere works the count back down until the item graduates out.
import { DIFFICULT_STORAGE_KEY } from '@/constants/storage';
import { readJson, writeJson } from '@/utils/practice';

type DifficultStore = Record<string, number>;

export const readDifficult = (): DifficultStore => readJson(DIFFICULT_STORAGE_KEY, {});

export const recordMiss = (key?: string) => {
  if (!key) return;
  const store = readDifficult();
  writeJson(DIFFICULT_STORAGE_KEY, { ...store, [key]: (store[key] ?? 0) + 1 });
};

export const recordHit = (key?: string) => {
  if (!key) return;
  const store = readDifficult();
  const count = store[key];
  if (!count) return;
  const next = { ...store };
  if (count > 1) next[key] = count - 1;
  if (count <= 1) delete next[key];
  writeJson(DIFFICULT_STORAGE_KEY, next);
};
