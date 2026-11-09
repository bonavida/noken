// Moves study data between browsers. An installed PWA has its own localStorage,
// separate from the browser it was added from, so this is the only way across.
import { SETTINGS_STORAGE_KEY } from '@/constants/site';
import {
  DIFFICULT_STORAGE_KEY,
  FLASHCARDS_STORAGE_KEY,
  PRACTICE_STATS_STORAGE_KEY,
  PROGRESS_STORAGE_KEY,
} from '@/constants/storage';

const BACKUP_APP = 'noken';
const BACKUP_VERSION = 1;

const BACKUP_STORAGE_KEYS = [
  SETTINGS_STORAGE_KEY,
  PROGRESS_STORAGE_KEY,
  FLASHCARDS_STORAGE_KEY,
  PRACTICE_STATS_STORAGE_KEY,
  DIFFICULT_STORAGE_KEY,
];

type BackupData = Record<string, Record<string, unknown>>;

export interface Backup {
  app: typeof BACKUP_APP;
  version: typeof BACKUP_VERSION;
  exportedAt: string;
  data: BackupData;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const parseRecord = (text: string): Record<string, unknown> | undefined => {
  try {
    const parsed: unknown = JSON.parse(text);
    return isRecord(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
};

export const createBackup = (now: Date = new Date()): Backup => {
  const data = BACKUP_STORAGE_KEYS.reduce<BackupData>((collected, key) => {
    const stored = parseRecord(localStorage.getItem(key) ?? '');
    return stored ? { ...collected, [key]: stored } : collected;
  }, {});
  return { app: BACKUP_APP, version: BACKUP_VERSION, exportedAt: now.toISOString(), data };
};

// Returns undefined for anything that isn't a Noken backup. Keys we don't own are
// dropped, so a hand-edited file can never write elsewhere in localStorage.
export const parseBackup = (text: string): Backup | undefined => {
  const parsed = parseRecord(text);
  if (!parsed || parsed.app !== BACKUP_APP || parsed.version !== BACKUP_VERSION) return undefined;

  const { data, exportedAt } = parsed;
  if (!isRecord(data) || typeof exportedAt !== 'string') return undefined;

  const known = BACKUP_STORAGE_KEYS.filter((key) => key in data);
  if (!known.every((key) => isRecord(data[key]))) return undefined;

  return {
    app: BACKUP_APP,
    version: BACKUP_VERSION,
    exportedAt,
    data: Object.fromEntries(known.map((key) => [key, data[key] as Record<string, unknown>])),
  };
};

// Replaces rather than merges: a store missing from the backup ends up empty
export const restoreBackup = ({ data }: Backup): void => {
  BACKUP_STORAGE_KEYS.forEach((key) => {
    const value = data[key];
    if (value) {
      localStorage.setItem(key, JSON.stringify(value));
      return;
    }
    localStorage.removeItem(key);
  });
};
