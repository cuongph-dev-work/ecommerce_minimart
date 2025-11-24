import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './locales/en.json';
import vi from './locales/vi.json';

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
    fallbackLng: 'vi',
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
  });

export default i18n;
