import type { Locale } from '@/i18n/config';

// Per-entry localized record: Spanish is required, other locales are additive
export type Localized = { es: string } & Partial<Record<Exclude<Locale, 'es'>, string>>;

export type LocalizedList = { es: string[] } & Partial<Record<Exclude<Locale, 'es'>, string[]>>;
