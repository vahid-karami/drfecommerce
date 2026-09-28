import { Fragment, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import apiClient from '../../api/client';
import { ENDPOINTS } from '../../api/endpoints';
import { useToast } from '../../context/ToastContext';
import Price from '../../components/Price';
import Icon from '../../components/Icon';
import { formatDate } from '../../utils/persianDate';
import { ORDER_STEPS, orderStatus, paymentStatus } from '../../utils/orderStatus';
import { toPersianNumber } from '../../hooks/useLanguage';
import { usePageMeta } from '../../utils/seo';

const STATUS_OPTIONS = [...ORDER_STEPS, 'cancelled'];

export default function AdminOrders() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'fa' ? 'fa' : 'en';
  const num = (n) => (lang === 'fa' ? toPersianNumber(n) : String(n));
  const { success, error: showError } = useToast();
  const [params, setParams] = useSearchParams();
  const [orders, setOrders] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [search, setSearch] = useState(params.get('search') || '');

  const statusFilter = params.get('status') || '';
  const paymentFilter = params.get('payment_status') || '';
  const searchParam = params.get('search') || '';

  usePageMeta({ title: t('admin.orders', 'سفارش‌ها') });

  useEffect(() => {
    let active = true;
    setOrders(null);
    apiClient
      .get(ENDPOINTS.adminOrders, { params: { status: statusFilter || undefined, payment_status: paymentFilter || undefined, search: searchParam || undefined } })
      .then((res) => active && setOrders(res.data))
      .catch(() => active && setOrders([]));
    return () => {
      active = false;
    };
  }, [statusFilter, paymentFilter, searchParam]);

  const setFilter = (changes) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    setParams(next);
  };

  const changeStatus = async (order, status) => {
    if (status === order.status) return;
    if (status === 'cancelled' && !window.confirm(t('admin.cancelConfirm', 'سفارش لغو و کالاها به موجودی برگردانده شوند؟'))) return;
    try {
      const { data } = await apiClient.patch(ENDPOINTS.adminOrderUpdate(order.order_number), { status });
      setOrders((list) => list.map((o) => (o.id === data.id ? data : o)));
      success(t('admin.statusUpdated', 'وضعیت سفارش به‌روز شد'));
    } catch (err) {
      showError(err.response?.data?.error || t('admin.updateFailed', 'به‌روزرسانی انجام نشد'));
    }
  };

  const tabs = [
    { key: '', label: t('orders.all', 'همه') },
    ...STATUS_OPTIONS.map((s) => ({ key: s, label: orderStatus(s, lang).label })),
  ];

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div>
          <h1>{t('admin.orders', 'سفارش‌ها')}</h1>
          <p className="muted">{t('admin.ordersHint', 'پیگیری، تغییر وضعیت و ارسال سفارش‌ها')}</p>
        </div>
        <form
          className="admin-search"
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            setFilter({ search: search.trim() });
          }}
        >
          <Icon name="search" size={18} />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('admin.searchOrders', 'شماره سفارش، نام یا موبایل مشتری')}
            aria-label={t('common.search')}
          />
        </form>
      </header>

      <div className="tab-row" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.key || 'all'}
            role="tab"
            aria-selected={statusFilter === tab.key}
            className={`tab ${statusFilter === tab.key ? 'active' : ''}`}
            onClick={() => setFilter({ status: tab.key })}
          >
            {tab.label}
          </button>
        ))}
        <label className="check-inline">
          <input
            type="checkbox"
            checked={paymentFilter === 'paid'}
            onChange={(e) => setFilter({ payment_status: e.target.checked ? 'paid' : '' })}
          />
          {t('admin.paidOnly', 'فقط پرداخت‌شده')}
        </label>
      </div>

      <section className="admin-card flush">
        {orders === null ? (
          <div className="loading"><div className="spinner" /></div>
        ) : orders.length === 0 ? (
          <p className="muted empty-inline">{t('admin.noMatchingOrders', 'سفارشی با این فیلتر پیدا نشد.')}</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th aria-label={t('orders.details', 'جزئیات سفارش')} />
                  <th>{t('payment.orderNumber', 'شماره سفارش')}</th>
                  <th>{t('admin.customer', 'مشتری')}</th>
                  <th>{t('admin.date', 'تاریخ')}</th>
                  <th>{t('cart.total')}</th>
                  <th>{t('admin.payment', 'پرداخت')}</th>
                  <th>{t('admin.status', 'وضعیت')}</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => {
                  const pay = paymentStatus(o.payment_status, lang);
                  const open = expanded === o.id;
                  return (
                    <Fragment key={o.id}>
                      <tr className={open ? 'is-open' : ''}>
                        <td>
                          <button
                            className="icon-btn row-toggle"
                            onClick={() => setExpanded(open ? null : o.id)}
                            aria-expanded={open}
                            aria-label={t('orders.details', 'جزئیات سفارش')}
                          >
                            <Icon name="chevronDown" size={18} />
                          </button>
                        </td>
                        <td dir="ltr" className="mono">{o.order_number}</td>
                        <td>
                          <div className="cell-stack">
                            <strong>{o.customer.name}</strong>
                            <span dir="ltr">{num(o.customer.phone || o.shipping_phone)}</span>
                          </div>
                        </td>
                        <td>{formatDate(o.created_at, lang)}</td>
                        <td><Price amount={o.total} /></td>
                        <td><span className={`status-pill tone-${pay.tone}`}>{pay.label}</span></td>
                        <td>
                          <select
                            className={`status-select tone-${orderStatus(o.status, lang).tone}`}
                            value={o.status}
                            onChange={(e) => changeStatus(o, e.target.value)}
                            disabled={o.status === 'cancelled'}
                            aria-label={t('admin.status', 'وضعیت')}
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s} value={s}>{orderStatus(s, lang).label}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                      {open && (
                        <tr className="row-detail">
                          <td colSpan={7}>
                            <div className="row-detail-grid">
                              <div>
                                <h3>{t('orders.items')}</h3>
                                <ul className="order-lines">
                                  {o.items.map((item) => (
                                    <li key={item.id}>
                                      <span className="order-line-name">{item.product_name}</span>
                                      <span className="muted">× {num(item.quantity)}</span>
                                      <Price amount={item.subtotal} />
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <h3>{t('orders.shippingAddress')}</h3>
                                <address className="order-address">
                                  <p>{o.shipping_address}</p>
                                  <p>{[o.shipping_state, o.shipping_city].filter(Boolean).join('، ')}</p>
                                  <p>{t('checkout.zipCode')}: <span dir="ltr">{num(o.shipping_zip)}</span></p>
                                  <p>{t('checkout.phone')}: <span dir="ltr">{num(o.shipping_phone)}</span></p>
                                </address>
                                {o.notes && <p className="muted">{t('checkout.orderNotes')}: {o.notes}</p>}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
