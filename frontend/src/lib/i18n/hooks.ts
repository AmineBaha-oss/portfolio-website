'use client';

import { useLanguage } from './context';
import { getTranslations, t as translate } from './translations';

export function useTranslations() {
  const { locale } = useLanguage();
  const translations = getTranslations(locale);
  
  const t = (key: string) => translate(locale, key);
  
  return {
    t,
    translations,
    locale,
  };
}
