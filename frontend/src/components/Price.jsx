import { useTranslation } from 'react-i18next';
import { toPersianNumber } from '../hooks/useLanguage';

export function Price({ amount, showSymbol = true }) {
  const { i18n, t } = useTranslation();
  const isPersian = i18n.language === 'fa';

  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return null;
  }

  const num = Number(amount);
  const formattedWithCommas = num.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  const displayAmount = isPersian ? toPersianNumber(formattedWithCommas) : formattedWithCommas;
  const symbol = showSymbol ? (isPersian ? 'تومان' : t('common.toman', 'Toman')) : '';

  return (
    <span className="price">
      {displayAmount}{symbol ? ` ${symbol}` : ''}
    </span>
  );
}

export default Price;
