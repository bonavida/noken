import { DEFAULT_LOCALE, LOCALES, type Locale } from '@/i18n/config';

// The default locale stays unprefixed, so its `lang` segment is absent:
// /kana for Spanish, /en/kana for English.
export const localeParam = (locale: Locale) => (locale === DEFAULT_LOCALE ? undefined : locale);

// Every static page under [...lang] spreads these over its own params
export const localeRoutes = () =>
  LOCALES.map((locale) => ({ params: { lang: localeParam(locale) }, props: { locale } }));

// Astro.currentLocale does not resolve through a [...lang] rest param in a
// static build, so the URL segment itself is the source of truth.
export const localeFromParams = (params: Record<string, string | undefined>): Locale =>
  params.lang === undefined
    ? DEFAULT_LOCALE
    : ((LOCALES.find((l) => l === params.lang) ?? DEFAULT_LOCALE) as Locale);
