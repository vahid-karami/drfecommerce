import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import apiClient from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import { OrderSkeleton } from '../components/Skeletons';
import { useToast } from '../context/ToastContext';
import { formatDate } from '../utils/persianDate';
import Price from '../components/Price';

export default function Orders() {
  const { t, i18n } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { success, error: showError } = useToast();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await apiClient.get(ENDPOINTS.orders);
        setOrders(response.data);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

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

  const handleCancel = async (orderNumber) => {
    if (!window.confirm(t('orders.cancelConfirm'))) return;
    try {
      await apiClient.post(ENDPOINTS.orderCancel(orderNumber));
      setOrders(orders.map((o) =>
        o.order_number === orderNumber ? { ...o, status: 'cancelled' } : o
      ));
      success('Order cancelled successfully');
    } catch (error) {
      showError(error.response?.data?.error || t('orders.cancelFailed'));
    }
  };

  if (loading) {
    return (
      <div className="orders-page">
        <div className="container">
          <OrderSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <h1>{t('orders.myOrders')}</h1>

      {orders.length === 0 ? (
        <div className="empty-orders">
          <span className="empty-icon">📦</span>
          <h2>{t('orders.noOrders')}</h2>
          <p>{t('orders.noOrdersDesc')}</p>
          <Link to="/products" className="btn btn-primary">{t('cart.browseProducts')}</Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div className="order-info">
                  <span className="order-number">{t('orders.orderNumber', { number: order.order_number })}</span>
                  <span className="order-date">
                    {t('orders.placedOn', { date: formatDate(order.created_at, i18n.language) })}
                  </span>
                </div>
                <span className={`order-status ${getStatusClass(order.status)}`}>
                  {order.status_display}
                </span>
              </div>

              <div className="order-items">
                {order.items.map((item, idx) => (
                  <div key={idx} className="order-item">
                    <span>{item.product_name}</span>
                    <span>{t('orders.quantity')}: {item.quantity}</span>
                    <span><Price amount={item.subtotal} /></span>
                  </div>
                ))}
              </div>

              <div className="order-footer">
                <div className="order-total">
                  <span>{t('cart.total')}:</span>
                  <span className="total-amount"><Price amount={order.total} /></span>
                </div>
                <div className="order-actions">
                  {(order.status === 'pending' || order.status === 'confirmed') && (
                    <button
                      onClick={() => handleCancel(order.order_number)}
                      className="btn btn-outline btn-sm"
                    >
                      {t('orders.cancelOrder')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
