import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    const dir = lng === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', lng);
  };

  return (
    <div className="language-switcher">
      <button
        onClick={() => changeLanguage('en')}
        className={`lang-btn ${i18n.language === 'en' ? 'active' : ''}`}
        aria-label="English"
      >
        EN
      </button>
      <span className="lang-divider">|</span>
      <button
        onClick={() => changeLanguage('fa')}
        className={`lang-btn ${i18n.language === 'fa' ? 'active' : ''}`}
        aria-label="فارسی"
      >
        فا
      </button>
    </div>
  );
}
