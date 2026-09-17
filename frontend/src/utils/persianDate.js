import { useTranslation } from 'react-i18next';

const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

const persianMonths = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
];

export function toPersianNumber(num) {
  if (num === null || num === undefined) return '';
  return String(num).replace(/[0-9]/g, (d) => persianDigits[d]);
}

export function toPersianDate(date, format = 'full') {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const year = d.getFullYear();
  const month = d.getMonth();
  const day = d.getDate();

  if (format === 'full') {
    const persianYear = toPersianNumber(year);
    const persianMonth = toPersianNumber(month + 1);
    const persianDay = toPersianNumber(day);
    return `${persianYear}/${persianMonth}/${persianDay}`;
  }

  if (format === 'short') {
    try {
      return new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(d);
    } catch {
      const persianDay = toPersianNumber(day);
      const persianMonthName = persianMonths[month];
      const persianYear = toPersianNumber(year);
      return `${persianDay} ${persianMonthName} ${persianYear}`;
    }
  }

  if (format === 'time') {
    const hours = toPersianNumber(d.getHours());
    const minutes = toPersianNumber(d.getMinutes().toString().padStart(2, '0'));
    return `${hours}:${minutes}`;
  }

  if (format === 'datetime') {
    return `${toPersianDate(date, 'short')} - ${toPersianDate(date, 'time')}`;
  }

  return toPersianDate(date, 'full');
}

export function formatDate(date, lang = 'en') {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  if (lang === 'fa') {
    return toPersianDate(d, 'short');
  }

  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return d.toLocaleDateString('en-US', options);
}

export function formatDateTime(date, lang = 'en') {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  if (lang === 'fa') {
    return toPersianDate(d, 'datetime');
  }

  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  return d.toLocaleDateString('en-US', options);
}

export function usePersianDate() {
  const { i18n } = useTranslation();
  const isPersian = i18n.language === 'fa';

  return {
    formatDate: (date) => formatDate(date, i18n.language),
    formatDateTime: (date) => formatDateTime(date, i18n.language),
    toPersianNumber: (num) => toPersianNumber(num),
    toPersianDate: (date, format) => toPersianDate(date, format),
    isPersian,
  };
}

