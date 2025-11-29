import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './locales/en.json';
import vi from './locales/vi.json';

// Only initialize on client side
if (typeof window !== 'undefined') {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources: {
        en: {
          translation: en,
        },
        vi: {
          translation: vi,
        },
      },
      lng: 'en', // Default to English
      fallbackLng: 'en',
      detection: {
        order: ['localStorage', 'navigator', 'htmlTag'],
        caches: ['localStorage'],
        // Only use detection if no language is set in localStorage
        lookupLocalStorage: 'i18nextLng',
      },
      interpolation: {
        escapeValue: false,
        formatSeparator: ',',
        format: (value, format, lng) => {
          if (format === 'number') {
            const num = typeof value === 'number' ? value : parseFloat(value);
            if (!isNaN(num)) {
              const locale = lng === 'en' ? 'en-US' : 'vi-VN';
              return new Intl.NumberFormat(locale).format(num);
            }
          }
          return value;
        },
      },
      react: {
        useSuspense: false,
      },
    });
} else {
  // Server-side: minimal init without LanguageDetector
  i18n
    .use(initReactI18next)
    .init({
      resources: {
        en: {
          translation: en,
        },
        vi: {
          translation: vi,
        },
      },
      lng: 'en',
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false,
        formatSeparator: ',',
        format: (value, format, lng) => {
          if (format === 'number') {
            const num = typeof value === 'number' ? value : parseFloat(value);
            if (!isNaN(num)) {
              const locale = lng === 'en' ? 'en-US' : 'vi-VN';
              return new Intl.NumberFormat(locale).format(num);
            }
          }
          return value;
        },
      },
      react: {
        useSuspense: false,
      },
    });
}

export default i18n;
