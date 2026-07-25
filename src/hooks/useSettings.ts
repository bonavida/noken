import { useState } from 'react';
import { DEFAULT_SETTINGS, readSettings, saveSettings, type Settings } from '@/utils/settings';

export const useSettings = () => {
  // Lazy init: localStorage exists only in the browser; islands also render on the server
  const [settings, setSettings] = useState<Settings>(() =>
    typeof window === 'undefined' ? DEFAULT_SETTINGS : readSettings()
  );

  // Functional update so consecutive toggles never overwrite each other;
  // saveSettings is idempotent, so a double updater call is harmless
  const updateSettings = (patch: Partial<Settings>) => {
    setSettings((current) => {
      const next = { ...current, ...patch };
      saveSettings(next);
      return next;
    });
  };

  return { settings, updateSettings };
};
