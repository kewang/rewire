import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const isEn = i18n.language === 'en';

  return (
    <button
      className="lang-switcher"
      onClick={() => i18n.changeLanguage(isEn ? 'zh-TW' : 'en')}
      title={isEn ? '繁體中文' : 'English'}
    >
      {isEn ? '中' : 'EN'}
    </button>
  );
}
