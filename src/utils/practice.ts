// Shared helpers for the practice islands.

export const shuffle = <T>(items: readonly T[]): T[] => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j]!, result[i]!];
  }
  return result;
};

export const sample = <T>(items: readonly T[], count: number): T[] =>
  shuffle(items).slice(0, count);

export const randomItem = <T>(items: readonly T[]): T =>
  items[Math.floor(Math.random() * items.length)]!;

export const randomInt = (min: number, max: number): number =>
  min + Math.floor(Math.random() * (max - min + 1));

export const readJson = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch {
    return fallback;
  }
};

export const writeJson = (key: string, value: unknown) => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Days since the epoch; Leitner scheduling works in whole days
export const epochDay = () => Math.floor(Date.now() / 86_400_000);
