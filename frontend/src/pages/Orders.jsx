import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import './Orders.css';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

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
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await apiClient.post(ENDPOINTS.orderCancel(orderNumber));
      setOrders(orders.map((o) =>
        o.order_number === orderNumber ? { ...o, status: 'cancelled' } : o
      ));
    } catch (error) {
      alert('Failed to cancel order');
    }
  };

  if (loading) {
    return <div className="loading">Loading orders...</div>;
  }

  return (
    <div className="orders-page">
      <h1>My Orders</h1>

      {orders.length === 0 ? (
        <div className="empty-orders">
          <span className="empty-icon">📦</span>
          <h2>No orders yet</h2>
          <p>Start shopping to see your orders here</p>
          <Link to="/products" className="btn btn-primary">Browse Products</Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div className="order-info">
                  <span className="order-number">#{order.order_number}</span>
                  <span className="order-date">
                    {new Date(order.created_at).toLocaleDateString()}
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
                    <span>Qty: {item.quantity}</span>
                    <span>${item.subtotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="order-footer">
                <div className="order-total">
                  <span>Total:</span>
                  <span className="total-amount">${order.total}</span>
                </div>
                <div className="order-actions">
                  {(order.status === 'pending' || order.status === 'confirmed') && (
                    <button
                      onClick={() => handleCancel(order.order_number)}
                      className="btn btn-outline btn-sm"
                    >
                      Cancel Order
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
