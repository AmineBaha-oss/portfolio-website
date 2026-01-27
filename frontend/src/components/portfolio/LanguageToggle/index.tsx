'use client';

import { useLanguage } from '@/lib/i18n/context';
import styles from './style.module.scss';

export default function LanguageToggle() {
  const { locale, setLocale } = useLanguage();

  return (
    <div className={styles.languageToggle}>
      <button
        className={`${styles.toggleButton} ${locale === 'en' ? styles.active : ''}`}
        onClick={() => setLocale('en')}
        aria-label="Switch to English"
      >
        EN
      </button>
      <button
        className={`${styles.toggleButton} ${locale === 'fr' ? styles.active : ''}`}
        onClick={() => setLocale('fr')}
        aria-label="Switch to French"
      >
        FR
      </button>
    </div>
  );
}
