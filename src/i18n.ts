import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import zhTW from './locales/zh-TW.json';
import en from './locales/en.json';
import ja from './locales/ja.json';
import ko from './locales/ko.json';
import fr from './locales/fr.json';
import th from './locales/th.json';

const STORAGE_KEY = 'rewire-lang';

export const SUPPORTED_LANGUAGES = [
  { code: 'zh-TW', label: '中文' },
  { code: 'en', label: 'EN' },
  { code: 'ja', label: 'JA' },
  { code: 'ko', label: 'KO' },
  { code: 'fr', label: 'FR' },
  { code: 'th', label: 'TH' },
] as const;

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
    ja: { translation: ja },
    ko: { translation: ko },
    fr: { translation: fr },
    th: { translation: th },
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
