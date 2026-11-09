import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createBackup, parseBackup, restoreBackup } from '@/utils/backup';

const backupWith = (data: unknown) =>
  JSON.stringify({ app: 'noken', version: 1, exportedAt: '2026-01-01T00:00:00.000Z', data });

beforeEach(() => {
  const store = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, value),
    removeItem: (key: string) => store.delete(key),
  });
});

describe('parseBackup', () => {
  it.each([
    ['invalid JSON', 'not json'],
    ['another app', JSON.stringify({ app: 'other', version: 1, exportedAt: '', data: {} })],
    ['a future version', JSON.stringify({ app: 'noken', version: 2, exportedAt: '', data: {} })],
    ['a store of the wrong shape', backupWith({ 'noken-progress': [1, 2] })],
    ['missing data', JSON.stringify({ app: 'noken', version: 1, exportedAt: '' })],
  ])('rejects %s', (_name, text) => {
    expect(parseBackup(text)).toBeUndefined();
  });

  it('drops keys that are not study data', () => {
    const backup = parseBackup(
      backupWith({ 'noken-progress': { n5: [1] }, 'someone-else': { a: 1 } })
    );
    expect(backup?.data).toEqual({ 'noken-progress': { n5: [1] } });
  });
});

describe('createBackup and restoreBackup', () => {
  it('round-trips the study data', () => {
    localStorage.setItem('noken-progress', JSON.stringify({ n5: [1, 2] }));
    localStorage.setItem('noken-difficult', JSON.stringify({ 猫: 3 }));
    const exported = JSON.stringify(createBackup());

    localStorage.removeItem('noken-progress');
    localStorage.removeItem('noken-difficult');
    restoreBackup(parseBackup(exported)!);

    expect(JSON.parse(localStorage.getItem('noken-progress') ?? '')).toEqual({ n5: [1, 2] });
    expect(JSON.parse(localStorage.getItem('noken-difficult') ?? '')).toEqual({ 猫: 3 });
  });

  it('clears stores the backup does not contain', () => {
    localStorage.setItem('noken-flashcards', JSON.stringify({ deck: {} }));
    restoreBackup(parseBackup(backupWith({}))!);
    expect(localStorage.getItem('noken-flashcards')).toBeNull();
  });
});
