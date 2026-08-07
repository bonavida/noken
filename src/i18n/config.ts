export const LOCALES = ['es', 'en'] as const;

export type Locale = (typeof LOCALES)[number];

// Spanish stays unprefixed at the root; other locales live under /<locale>/
export const DEFAULT_LOCALE: Locale = 'es';
