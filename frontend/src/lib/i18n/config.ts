export const locales = ['en', 'fr'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export function isValidLocale(locale: string | null): locale is Locale {
  return locale !== null && locales.includes(locale as Locale);
}

export function getLocale(): Locale {
  if (typeof window === 'undefined') {
    return defaultLocale;
  }
  
  const stored = localStorage.getItem('locale');
  if (isValidLocale(stored)) {
    return stored;
  }
  
  // Try to detect from browser
  const browserLang = navigator.language.split('-')[0];
  if (isValidLocale(browserLang)) {
    return browserLang;
  }
  
  return defaultLocale;
}

export function setLocale(locale: Locale): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('locale', locale);
  }
}
