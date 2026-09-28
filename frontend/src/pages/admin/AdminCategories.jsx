import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import apiClient from '../../api/client';
import { DJANGO_ADMIN_URL, ENDPOINTS } from '../../api/endpoints';
import Icon from '../../components/Icon';
import { toPersianNumber } from '../../hooks/useLanguage';
import { usePageMeta } from '../../utils/seo';

export default function AdminCategories() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'fa' ? 'fa' : 'en';
  const num = (n) => (lang === 'fa' ? toPersianNumber(n) : String(n));
  const [categories, setCategories] = useState(null);

  usePageMeta({ title: t('admin.categories', 'دسته‌بندی‌ها') });

  useEffect(() => {
    apiClient
      .get(ENDPOINTS.categories)
      .then((res) => setCategories(res.data.results || res.data))
      .catch(() => setCategories([]));
  }, []);

  const djangoUrl = (path) => `${DJANGO_ADMIN_URL}products/category/${path}`;

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div>
          <h1>{t('admin.categories', 'دسته‌بندی‌ها')}</h1>
          <p className="muted">{t('admin.categoriesHint', 'نام، توضیحات و تصویر دسته‌ها در بخش مدیریت پیشرفته ویرایش می‌شوند.')}</p>
        </div>
        <a href={djangoUrl('add/')} target="_blank" rel="noreferrer" className="btn btn-primary">
          <Icon name="plus" size={18} /> {t('admin.addCategory', 'دسته‌بندی جدید')}
        </a>
      </header>

      {categories === null ? (
        <div className="loading"><div className="spinner" /></div>
      ) : (
        <div className="admin-tile-grid">
          {categories.map((c) => (
            <article key={c.id} className="admin-tile">
              <div className="admin-tile-img">
                {c.image ? <img src={c.image} alt="" /> : <span className="no-image"><Icon name="box" size={28} /> {t('admin.noImage', 'بدون تصویر')}</span>}
              </div>
              <div className="admin-tile-body">
                <h3>{c.name_fa || c.name}</h3>
                <span className="muted" dir="ltr">{c.name}</span>
                <span className="muted">{t('products.productsCount', { count: num(c.product_count) })}</span>
              </div>
              <div className="admin-tile-actions">
                <a href={djangoUrl(`${c.id}/change/`)} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
                  <Icon name="ruler" size={16} /> {t('admin.edit', 'ویرایش')}
                </a>
                <Link to={`/products?category=${c.slug}`} className="btn btn-ghost btn-sm">{t('admin.viewInShop', 'نمایش در فروشگاه')}</Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
