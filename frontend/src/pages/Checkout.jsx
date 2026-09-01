import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import { useCart } from '../context/CartContext';


export default function Checkout() {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();

  const [formData, setFormData] = useState({
    shipping_address: '',
    shipping_city: '',
    shipping_state: '',
    shipping_zip: '',
    shipping_country: 'US',
    shipping_phone: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiClient.post(ENDPOINTS.orderCreate, formData);
      await clearCart();
      navigate(`/orders/${response.data.order_number}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const subtotal = cart.total_price;
  const shipping = subtotal >= 100 ? 0 : 9.99;
  const total = subtotal + shipping;

  if (!cart.items || cart.items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="checkout-page">
      <h1>Checkout</h1>

      <div className="checkout-content">
        <form onSubmit={handleSubmit} className="checkout-form">
          <section className="form-section">
            <h2>Shipping Information</h2>

            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              <label htmlFor="shipping_phone">Phone Number *</label>
              <input
                type="tel"
                id="shipping_phone"
                name="shipping_phone"
                value={formData.shipping_phone}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="shipping_address">Address *</label>
              <textarea
                id="shipping_address"
                name="shipping_address"
                value={formData.shipping_address}
                onChange={handleChange}
                required
                className="form-input"
                rows={3}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="shipping_city">City *</label>
                <input
                  type="text"
                  id="shipping_city"
                  name="shipping_city"
                  value={formData.shipping_city}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="shipping_state">State</label>
                <input
                  type="text"
                  id="shipping_state"
                  name="shipping_state"
                  value={formData.shipping_state}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="shipping_zip">ZIP Code *</label>
                <input
                  type="text"
                  id="shipping_zip"
                  name="shipping_zip"
                  value={formData.shipping_zip}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="shipping_country">Country *</label>
                <select
                  id="shipping_country"
                  name="shipping_country"
                  value={formData.shipping_country}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="UK">United Kingdom</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="notes">Order Notes (optional)</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="form-input"
                rows={3}
                placeholder="Special instructions for delivery..."
              />
            </div>
          </section>

          <button type="submit" disabled={loading} className="btn btn-primary btn-lg btn-full">
            {loading ? 'Placing Order...' : `Place Order - $${total.toFixed(2)}`}
          </button>
        </form>

        <div className="order-summary">
          <h2>Order Summary</h2>

          <div className="summary-items">
            {cart.items.map((item) => (
              <div key={item.id} className="summary-item">
                <div className="item-info">
                  <span className="item-name">{item.product.name}</span>
                  <span className="item-qty">x{item.quantity}</span>
                </div>
                <span className="item-price">${item.subtotal.toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="summary-divider" />

          <div className="summary-row">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>

          <div className="summary-row">
            <span>Shipping</span>
            <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
          </div>

          <div className="summary-row total">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
