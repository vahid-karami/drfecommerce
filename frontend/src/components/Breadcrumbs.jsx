import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Icon from './Icon';

export default function Breadcrumbs({ items }) {
  const { t } = useTranslation();
  return (
    <nav className="breadcrumbs" aria-label={t('common.breadcrumb', 'مسیر صفحه')}>
      <ol>
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`}>
              {item.to && !last ? <Link to={item.to}>{item.label}</Link> : <span aria-current={last ? 'page' : undefined}>{item.label}</span>}
              {!last && <Icon name="chevronLeft" size={14} className="flip-ltr" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
