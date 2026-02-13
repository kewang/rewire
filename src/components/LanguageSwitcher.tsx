import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from '../i18n';
import './LanguageSwitcher.css';

export default function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', handleClick);
    return () => document.removeEventListener('pointerdown', handleClick);
  }, [open]);

  const current = SUPPORTED_LANGUAGES.find(l => l.code === i18n.language) ?? SUPPORTED_LANGUAGES[0];

  return (
    <div className="lang-switcher-wrap" ref={ref}>
      <button
        className={`lang-switcher${open ? ' lang-switcher--open' : ''}`}
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="lang-switcher__code">{current.label}</span>
        <span className="lang-switcher__caret" aria-hidden>&#x25BE;</span>
      </button>
      {open && (
        <ul className="lang-dropdown" role="listbox">
          {SUPPORTED_LANGUAGES.map(lang => {
            const active = lang.code === i18n.language;
            return (
              <li key={lang.code} role="option" aria-selected={active}>
                <button
                  className={`lang-dropdown__item${active ? ' lang-dropdown__item--active' : ''}`}
                  onClick={() => { i18n.changeLanguage(lang.code); setOpen(false); }}
                  disabled={active}
                >
                  <span className="lang-dropdown__label">{t(`language.${lang.code}`)}</span>
                  <span className="lang-dropdown__tag">{lang.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
