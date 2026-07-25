import { SETTINGS_STORAGE_KEY } from '@/constants/site';

export type Theme = 'light' | 'dark' | 'system';

export interface Settings {
  theme: Theme;
  furigana: boolean;
  hideTranslations: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  theme: 'system',
  furigana: true,
  hideTranslations: false,
};

export const readSettings = (): Settings => {
  try {
    const stored = JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY) ?? '{}');
    return { ...DEFAULT_SETTINGS, ...stored };
  } catch {
    return DEFAULT_SETTINGS;
  }
};

const applySettings = ({ theme, furigana, hideTranslations }: Settings) => {
  const prefersDark = matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = theme === 'dark' || (theme === 'system' && prefersDark);
  const { classList } = document.documentElement;
  classList.toggle('dark', isDark);
  classList.toggle('hide-furigana', !furigana);
  classList.toggle('hide-translations', hideTranslations);
};

export const saveSettings = (settings: Settings) => {
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  applySettings(settings);
};
