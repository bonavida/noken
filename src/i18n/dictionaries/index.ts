import type { Locale } from '@/i18n/config';
import { en } from '@/i18n/dictionaries/en';
import { es, type UIDictionary } from '@/i18n/dictionaries/es';

export const dictionaries: Record<Locale, UIDictionary> = { es, en };

export type { UIDictionary };
