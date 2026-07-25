import { DEFAULT_LOCALE, type Locale } from '@/i18n/config';
import { dictionaries, type UIDictionary } from '@/i18n/dictionaries';
import type { Localized, LocalizedList } from '@/types/content';

export const useTranslations = (locale: Locale = DEFAULT_LOCALE): UIDictionary =>
  dictionaries[locale];

export const pickLocale = (localized: Localized, locale: Locale = DEFAULT_LOCALE): string =>
  localized[locale] ?? localized.es;

export const pickLocaleList = (
  localized: LocalizedList,
  locale: Locale = DEFAULT_LOCALE
): string[] => localized[locale] ?? localized.es;

export const resolveLocale = (value: string | undefined): Locale =>
  value && value in dictionaries ? (value as Locale) : DEFAULT_LOCALE;
