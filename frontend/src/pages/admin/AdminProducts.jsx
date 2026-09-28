import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import apiClient from '../../api/client';
import { DJANGO_ADMIN_URL, ENDPOINTS } from '../../api/endpoints';
import { useToast } from '../../context/ToastContext';
import Price from '../../components/Price';
import Icon from '../../components/Icon';
import { BODY_PARTS } from '../../utils/bodyParts';
import { useCategories } from '../../utils/catalog';
import { fetchAllPages } from '../../utils/fetchAll';
import { toPersianNumber } from '../../hooks/useLanguage';
import { usePageMeta } from '../../utils/seo';

const EMPTY_FORM = {
  name: '', name_fa: '', description: '', description_fa: '', category: '',
  price: '', cost: '', discount_price: '', stock: '', injury_type: 'general',
  brand: '', size: '', color: '', weight: '', material: '', is_active: true, is_featured: false,
};

const toNumberOrNull = (v, parse = parseFloat) => (v === '' || v === null || v === undefined ? null : parse(v));

export default function AdminProducts() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'fa' ? 'fa' : 'en';
  const num = (n) => (lang === 'fa' ? toPersianNumber(n) : String(n));
  const { success, error: showError } = useToast();
  const categories = useCategories();
  const [products, setProducts] = useState(null);
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('all');
  const [editing, setEditing] = useState(null); // null = closed, {} = new, product = edit
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  usePageMeta({ title: t('admin.products', 'محصولات') });

  const load = useCallback(() => {
    fetchAllPages(ENDPOINTS.adminProducts)
      .then(setProducts)
      .catch(() => {
        setProducts([]);
        showError(t('admin.loadFailed', 'بارگذاری اطلاعات انجام نشد'));
      });
  }, [showError, t]);

  useEffect(() => {
    load();
  }, [load]);

  const tabs = [
    { key: 'all', label: t('orders.all', 'همه'), test: () => true },
    { key: 'active', label: t('admin.active', 'فعال'), test: (p) => p.is_active },
    { key: 'inactive', label: t('admin.inactive', 'غیرفعال'), test: (p) => !p.is_active },
    { key: 'out', label: t('common.outOfStock'), test: (p) => p.stock === 0 },
    { key: 'featured', label: t('product.bestseller', 'پرفروش'), test: (p) => p.is_featured },
  ];

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const test = tabs.find((x) => x.key === tab).test;
    return (products || []).filter(
      (p) => test(p) && (!q || [p.name, p.name_fa, p.brand, p.slug].some((v) => (v || '').toLowerCase().includes(q))),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, query, tab]);

  const openNew = () => {
    setForm(EMPTY_FORM);
    setFormError('');
    setEditing({});
  };

  const openEdit = (p) => {
    setForm({
      ...EMPTY_FORM,
      ...Object.fromEntries(Object.keys(EMPTY_FORM).map((k) => [k, p[k] ?? EMPTY_FORM[k]])),
      category: p.category ?? '',
      price: p.price != null ? String(Number(p.price)) : '',
      cost: p.cost != null ? String(Number(p.cost)) : '',
      discount_price: p.discount_price != null ? String(Number(p.discount_price)) : '',
      weight: p.weight != null ? String(Number(p.weight)) : '',
      stock: String(p.stock ?? ''),
    });
    setFormError('');
    setEditing(p);
  };

  const setField = (name, value) => setForm((f) => ({ ...f, [name]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    const payload = {
      ...form,
      category: form.category ? parseInt(form.category, 10) : null,
      price: toNumberOrNull(form.price) ?? 0,
      cost: toNumberOrNull(form.cost),
      discount_price: toNumberOrNull(form.discount_price),
      stock: parseInt(form.stock, 10) || 0,
      weight: toNumberOrNull(form.weight),
    };
    try {
      if (editing?.slug) {
        await apiClient.patch(ENDPOINTS.adminProductDetail(editing.slug), payload);
        success(t('admin.productUpdated', 'محصول به‌روز شد'));
      } else {
        await apiClient.post(ENDPOINTS.adminProducts, payload);
        success(t('admin.productCreated', 'محصول ایجاد شد'));
      }
      setEditing(null);
      load();
    } catch (err) {
      const data = err.response?.data;
      const fieldErrors = data && typeof data === 'object' && !data.error
        ? Object.entries(data).map(([field, msgs]) => `${field}: ${[].concat(msgs).join(' ')}`).join(' — ')
        : '';
      setFormError(data?.error || fieldErrors || t('admin.saveFailed', 'ذخیره محصول انجام نشد'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (p) => {
    if (!window.confirm(t('admin.deleteConfirm', '«{{name}}» حذف شود؟ این کار برگشت‌پذیر نیست.', { name: p.name_fa || p.name }))) return;
    try {
      await apiClient.delete(ENDPOINTS.adminProductDetail(p.slug));
      success(t('admin.productDeleted', 'محصول حذف شد'));
      setProducts((list) => list.filter((x) => x.id !== p.id));
    } catch (err) {
      showError(err.response?.data?.detail || t('admin.deleteFailed', 'حذف انجام نشد (ممکن است در سفارشی استفاده شده باشد).'));
    }
  };

  const input = (name, label, props = {}) => (
    <div className="form-group">
      <label className="form-label" htmlFor={`p-${name}`}>{label}</label>
      <input id={`p-${name}`} value={form[name]} onChange={(e) => setField(name, e.target.value)} className="form-input" {...props} />
    </div>
  );

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div>
          <h1>{t('admin.products', 'محصولات')}</h1>
          <p className="muted">
            {products ? t('admin.productsCount', '{{count}} محصول در فروشگاه', { count: num(products.length) }) : t('common.loading')}
          </p>
        </div>
        <div className="admin-head-actions">
          <div className="admin-search">
            <Icon name="search" size={18} />
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('admin.searchProducts', 'جستجوی نام، برند یا کد')} aria-label={t('common.search')} />
          </div>
          <button onClick={openNew} className="btn btn-primary">
            <Icon name="plus" size={18} /> {t('admin.addProduct', 'محصول جدید')}
          </button>
        </div>
      </header>

      <div className="tab-row" role="tablist">
        {tabs.map((x) => (
          <button key={x.key} role="tab" aria-selected={tab === x.key} className={`tab ${tab === x.key ? 'active' : ''}`} onClick={() => setTab(x.key)}>
            {x.label}
            <span className="tab-count">{num((products || []).filter(x.test).length)}</span>
          </button>
        ))}
      </div>

      <section className="admin-card flush">
        {products === null ? (
          <div className="loading"><div className="spinner" /></div>
        ) : visible.length === 0 ? (
          <p className="muted empty-inline">{t('products.noProductsFound')}</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t('admin.product', 'محصول')}</th>
                  <th>{t('product.category')}</th>
                  <th>{t('common.price')}</th>
                  <th>{t('admin.margin', 'سود')}</th>
                  <th>{t('admin.stock', 'موجودی')}</th>
                  <th>{t('admin.status', 'وضعیت')}</th>
                  <th><span className="sr-only">{t('admin.actions', 'عملیات')}</span></th>
                </tr>
              </thead>
              <tbody>
                {visible.map((p) => {
                  const discounted = p.discount_price && Number(p.discount_price) < Number(p.price);
                  return (
                    <tr key={p.id} className={p.is_active ? '' : 'is-muted'}>
                      <td>
                        <div className="product-cell">
                          <span className="product-thumb">
                            {p.primary_image ? <img src={p.primary_image} alt="" /> : <Icon name="box" size={20} />}
                          </span>
                          <div className="cell-stack">
                            <strong>{p.name_fa || p.name}</strong>
                            <span className="muted">{p.brand || '—'}</span>
                          </div>
                        </div>
                      </td>
                      <td>{p.category_name_fa || p.category_name || '—'}</td>
                      <td>
                        <div className="cell-stack">
                          <Price amount={discounted ? p.discount_price : p.price} />
                          {discounted && <span className="price-was"><Price amount={p.price} showSymbol={false} /></span>}
                        </div>
                      </td>
                      <td>
                        {p.margin != null ? (
                          <span className={p.margin >= 0 ? 'text-ok' : 'text-bad'}>{num(p.margin_percent)}٪</span>
                        ) : '—'}
                      </td>
                      <td>
                        <span className={`status-pill ${p.stock === 0 ? 'tone-bad' : p.stock <= 5 ? 'tone-warn' : 'tone-ok'}`}>{num(p.stock)}</span>
                      </td>
                      <td>
                        <div className="order-badges">
                          <span className={`status-pill ${p.is_active ? 'tone-info' : 'tone-bad'}`}>{p.is_active ? t('admin.active', 'فعال') : t('admin.inactive', 'غیرفعال')}</span>
                          {p.is_featured && <span className="status-pill tone-ok">{t('product.bestseller', 'پرفروش')}</span>}
                        </div>
                      </td>
                      <td>
                        <div className="row-actions">
                          <button className="icon-btn" onClick={() => openEdit(p)} aria-label={t('admin.edit', 'ویرایش')} title={t('admin.edit', 'ویرایش')}>
                            <Icon name="ruler" size={18} />
                          </button>
                          <a
                            className="icon-btn"
                            href={`${DJANGO_ADMIN_URL}products/product/${p.id}/change/`}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={t('admin.manageImages', 'مدیریت تصاویر')}
                            title={t('admin.manageImages', 'مدیریت تصاویر')}
                          >
                            <Icon name="box" size={18} />
                          </a>
                          <button className="icon-btn danger-btn" onClick={() => handleDelete(p)} aria-label={t('admin.delete', 'حذف')} title={t('admin.delete', 'حذف')}>
                            <Icon name="close" size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div className="modal modal-lg" role="dialog" aria-modal="true" aria-labelledby="product-form-title" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 id="product-form-title">{editing.slug ? t('admin.editProduct', 'ویرایش محصول') : t('admin.addProduct', 'محصول جدید')}</h2>
              <button onClick={() => setEditing(null)} className="icon-btn" aria-label={t('common.close', 'بستن')}><Icon name="close" /></button>
            </div>
            <form onSubmit={handleSubmit} className="admin-form">
              {formError && <p className="form-alert">{formError}</p>}

              <fieldset>
                <legend>{t('admin.basicInfo', 'اطلاعات اصلی')}</legend>
                <div className="form-grid two">
                  {input('name_fa', t('admin.nameFa', 'نام فارسی'), { required: true })}
                  {input('name', t('admin.nameEn', 'نام انگلیسی'), { dir: 'ltr', required: true })}
                  <div className="form-group">
                    <label className="form-label" htmlFor="p-category">{t('product.category')}</label>
                    <select id="p-category" value={form.category} onChange={(e) => setField('category', e.target.value)} className="form-select" required>
                      <option value="">{t('admin.selectCategory', 'انتخاب دسته‌بندی')}</option>
                      {categories.map((c) => <option key={c.id} value={c.id}>{c.name_fa || c.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="p-injury">{t('products.bodyPart')}</label>
                    <select id="p-injury" value={form.injury_type} onChange={(e) => setField('injury_type', e.target.value)} className="form-select">
                      {BODY_PARTS.map((b) => <option key={b.key} value={b.key}>{lang === 'fa' ? b.fa : b.en}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="p-desc-fa">{t('admin.descFa', 'توضیحات فارسی')}</label>
                  <textarea id="p-desc-fa" value={form.description_fa} onChange={(e) => setField('description_fa', e.target.value)} className="form-textarea" rows={3} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="p-desc">{t('admin.descEn', 'توضیحات انگلیسی')}</label>
                  <textarea id="p-desc" value={form.description} onChange={(e) => setField('description', e.target.value)} className="form-textarea" rows={2} dir="ltr" required />
                </div>
              </fieldset>

              <fieldset>
                <legend>{t('admin.pricing', 'قیمت و موجودی (تومان)')}</legend>
                <div className="form-grid">
                  {input('price', t('admin.price', 'قیمت فروش'), { type: 'number', min: 0, step: 1000, dir: 'ltr', required: true })}
                  {input('discount_price', t('admin.discountPrice', 'قیمت با تخفیف'), { type: 'number', min: 0, step: 1000, dir: 'ltr' })}
                  {input('cost', t('admin.cost', 'قیمت خرید'), { type: 'number', min: 0, step: 1000, dir: 'ltr' })}
                  {input('stock', t('admin.stock', 'موجودی'), { type: 'number', min: 0, dir: 'ltr', required: true })}
                </div>
              </fieldset>

              <fieldset>
                <legend>{t('product.specifications')}</legend>
                <div className="form-grid">
                  {input('brand', t('product.brand', 'برند'))}
                  {input('size', t('product.size'))}
                  {input('color', t('product.color'))}
                  {input('material', t('product.material'))}
                  {input('weight', t('admin.weight', 'وزن (گرم)'), { type: 'number', min: 0, dir: 'ltr' })}
                </div>
                <div className="switch-row">
                  <label className="check-inline">
                    <input type="checkbox" checked={form.is_active} onChange={(e) => setField('is_active', e.target.checked)} />
                    {t('admin.activeHint', 'نمایش در فروشگاه')}
                  </label>
                  <label className="check-inline">
                    <input type="checkbox" checked={form.is_featured} onChange={(e) => setField('is_featured', e.target.checked)} />
                    {t('admin.featuredHint', 'نمایش در پرفروش‌ها')}
                  </label>
                </div>
              </fieldset>

              <div className="modal-actions">
                {editing.slug && (
                  <a className="text-btn" href={`${DJANGO_ADMIN_URL}products/product/${editing.id}/change/`} target="_blank" rel="noreferrer">
                    {t('admin.manageImages', 'مدیریت تصاویر')}
                  </a>
                )}
                <button type="button" onClick={() => setEditing(null)} className="btn btn-outline">{t('admin.cancel', 'انصراف')}</button>
                <button type="submit" disabled={saving} className="btn btn-primary">
                  {saving ? t('common.loading') : t('admin.save', 'ذخیره')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
