import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../api/client';
import { ENDPOINTS } from '../api/endpoints';


export default function OrderDetail() {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await apiClient.get(ENDPOINTS.orderDetail(orderNumber));
        setOrder(response.data);
      } catch (err) {
        setError('Order not found');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderNumber]);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await apiClient.post(ENDPOINTS.orderCancel(orderNumber));
      setOrder({ ...order, status: 'cancelled' });
    } catch (err) {
      alert('Failed to cancel order');
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
    return <div className="loading">Loading order...</div>;
  }

  if (error || !order) {
    return (
      <div className="order-detail-page">
        <div className="error-state">
          <h2>Order not found</h2>
          <Link to="/orders" className="btn btn-primary">View All Orders</Link>
        </div>
      </div>
    );
  }

  const statusSteps = getStatusSteps(order.status);

  return (
    <div className="order-detail-page">
      <div className="order-header">
        <div>
          <h1>Order #{order.order_number}</h1>
          <p className="order-date">
            Placed on {new Date(order.created_at).toLocaleDateString()}
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
          <h2>Items</h2>
          {order.items.map((item, idx) => (
            <div key={idx} className="order-item">
              <div className="item-details">
                <h3>{item.product_name}</h3>
                <p>Quantity: {item.quantity}</p>
              </div>
              <span className="item-price">${item.subtotal.toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="order-info">
          <div className="info-section">
            <h2>Shipping Address</h2>
            <p>{order.shipping_address}</p>
            <p>
              {order.shipping_city}, {order.shipping_state} {order.shipping_zip}
            </p>
            <p>{order.shipping_country}</p>
            <p>Phone: {order.shipping_phone}</p>
          </div>

          <div className="info-section">
            <h2>Order Summary</h2>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>${order.subtotal}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>{order.shipping_cost == 0 ? 'Free' : `$${order.shipping_cost}`}</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>${order.total}</span>
            </div>
          </div>

          {(order.status === 'pending' || order.status === 'confirmed') && (
            <button onClick={handleCancel} className="btn btn-outline">
              Cancel Order
            </button>
          )}
        </div>
      </div>

      <Link to="/orders" className="back-link">← Back to Orders</Link>
    </div>
  );
}
