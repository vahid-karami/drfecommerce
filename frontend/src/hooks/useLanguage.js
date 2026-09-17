import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

export function toPersianNumber(num) {
  if (num === null || num === undefined) return '';
  return String(num).replace(/[0-9]/g, (d) => persianDigits[d]);
}

export function toPersianPrice(price) {
  if (price === null || price === undefined) return '';
  const formatted = Number(price).toFixed(2);
  return toPersianNumber(formatted);
}

export function useLanguage() {
  const { i18n } = useTranslation();

  const setLanguage = useCallback((lang) => {
    i18n.changeLanguage(lang);
    const dir = lang === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', lang);
    localStorage.setItem('i18nextLng', lang);
  }, [i18n]);

  const isRTL = i18n.language === 'fa';
  const isPersian = i18n.language === 'fa';

  return {
    i18n,
    setLanguage,
    isRTL,
    isPersian,
    currentLanguage: i18n.language,
    toPersianNumber: isPersian ? toPersianNumber : (n) => String(n),
    toPersianPrice: isPersian ? toPersianPrice : (p) => Number(p).toFixed(2),
  };
}
