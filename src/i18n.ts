import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import zhTW from './locales/zh-TW.json';
import en from './locales/en.json';

const STORAGE_KEY = 'rewire-lang';

function getSavedLanguage(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? 'zh-TW';
  } catch {
    return 'zh-TW';
  }
}

i18n.use(initReactI18next).init({
  resources: {
    'zh-TW': { translation: zhTW },
    en: { translation: en },
  },
  lng: getSavedLanguage(),
  fallbackLng: 'zh-TW',
  interpolation: {
    escapeValue: false,
  },
});

i18n.on('languageChanged', (lng) => {
  try {
    localStorage.setItem(STORAGE_KEY, lng);
  } catch {
    // localStorage unavailable
  }
});

export default i18n;
