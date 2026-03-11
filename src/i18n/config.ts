import { Pathnames, LocalePrefix } from 'next-intl/routing';

export const locales = ['zh', 'en'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'zh';

export const pathnames: Pathnames<typeof locales> = {
  '/': '/',
  '/dashboard': '/dashboard',
  '/settings': '/settings',
  '/auth/signin': '/auth/signin',
  '/auth/error': '/auth/error'
};

export const localePrefix: LocalePrefix<typeof locales> = 'always';
