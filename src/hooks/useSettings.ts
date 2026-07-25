import { useState } from 'react';
import { DEFAULT_SETTINGS, readSettings, saveSettings, type Settings } from '@/utils/settings';

export const useSettings = () => {
  // Lazy init: localStorage exists only in the browser; islands also render on the server
  const [settings, setSettings] = useState<Settings>(() =>
    typeof window === 'undefined' ? DEFAULT_SETTINGS : readSettings()
  );

  const updateSettings = (patch: Partial<Settings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    saveSettings(next);
  };

  return { settings, updateSettings };
};
