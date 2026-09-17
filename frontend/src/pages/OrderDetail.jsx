import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import apiClient from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import { formatDate } from '../utils/persianDate';
import Price from '../components/Price';

export default function OrderDetail() {
  const { t, i18n } = useTranslation();
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await apiClient.get(ENDPOINTS.orderDetail(orderNumber));
        setOrder(response.data);
      } catch {
        setError(t('orders.notFound'));
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderNumber, t]);

  const handleCancel = async () => {
    if (!window.confirm(t('orders.cancelConfirm'))) return;
    try {
      await apiClient.post(ENDPOINTS.orderCancel(orderNumber));
      setOrder({ ...order, status: 'cancelled' });
    } catch {
      alert(t('orders.cancelFailed'));
    }
  };

  const getStatusClass = (status) => {
    const classes = {
      pending: 'status-pending',
      confirmed: 'status-confirmed',
      processing: 'status-processing',
      shipped: 'status-shipped',
      delivered: 'status-delivered',
      cancelled: 'status-cancelled',
    };
    return classes[status] || '';
  };

  const getStatusSteps = (currentStatus) => {
    const steps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    const currentIndex = steps.indexOf(currentStatus);
    return steps.map((step, index) => ({
      name: step,
      completed: index <= currentIndex,
      active: index === currentIndex,
    }));
  };

  if (loading) {
    return <div className="loading">{t('common.loading')}</div>;
  }

  if (error || !order) {
    return (
      <div className="order-detail-page">
        <div className="error-state">
          <h2>{t('orders.notFound')}</h2>
          <Link to="/orders" className="btn btn-primary">{t('orders.viewAll')}</Link>
        </div>
      </div>
    );
  }

  const statusSteps = getStatusSteps(order.status);

  return (
    <div className="order-detail-page">
      <div className="order-header">
        <div>
          <h1>{t('orders.orderNumber', { number: order.order_number })}</h1>
          <p className="order-date">
            {t('orders.placedOn', { date: formatDate(order.created_at, i18n.language) })}
          </p>
        </div>
        <span className={`order-status ${getStatusClass(order.status)}`}>
          {order.status_display}
        </span>
      </div>

      {order.status !== 'cancelled' && (
        <div className="order-timeline">
          {statusSteps.map((step, index) => (
            <div
              key={step.name}
              className={`timeline-step ${step.completed ? 'completed' : ''} ${step.active ? 'active' : ''}`}
            >
              <div className="step-indicator">
                {step.completed ? '✓' : index + 1}
              </div>
              <span className="step-name">{step.name}</span>
            </div>
          ))}
        </div>
      )}

      <div className="order-content">
        <div className="order-items">
          <h2>{t('orders.items')}</h2>
          {order.items.map((item, idx) => (
            <div key={idx} className="order-item">
              <div className="item-details">
                <h3>{item.product_name}</h3>
                <p>{t('orders.quantity')}: {item.quantity}</p>
              </div>
              <span className="item-price"><Price amount={item.subtotal} /></span>
            </div>
          ))}
        </div>

        <div className="order-info">
          <div className="info-section">
            <h2>{t('orders.shippingAddress')}</h2>
            <p>{order.shipping_address}</p>
            <p>
              {order.shipping_city}, {order.shipping_state} {order.shipping_zip}
            </p>
            <p>{order.shipping_country}</p>
            <p>{t('auth.phoneNumber')}: {order.shipping_phone}</p>
          </div>

          <div className="info-section">
            <h2>{t('cart.orderSummary')}</h2>
            <div className="summary-row">
              <span>{t('cart.subtotal')}</span>
              <span><Price amount={order.subtotal} /></span>
            </div>
            <div className="summary-row">
              <span>{t('cart.shipping')}</span>
              <span>{order.shipping_cost == 0 ? t('cart.free') : <Price amount={order.shipping_cost} />}</span>
            </div>
            <div className="summary-row total">
              <span>{t('cart.total')}</span>
              <span><Price amount={order.total} /></span>
            </div>
          </div>

          {(order.status === 'pending' || order.status === 'confirmed') && (
            <button onClick={handleCancel} className="btn btn-outline">
              {t('orders.cancelOrder')}
            </button>
          )}
        </div>
      </div>

      <Link to="/orders" className="back-link">← {t('orders.backToOrders')}</Link>
    </div>
  );
}
