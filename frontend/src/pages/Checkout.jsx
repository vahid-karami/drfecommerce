import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import apiClient from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Price from '../components/Price';
import { validateIranianPhone } from '../utils/iranianPhone';
import {
  IRANIAN_PROVINCES,
  validateIranianPostalCode,
} from '../utils/iranianAddress';

export default function Checkout() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const { success, error: showError } = useToast();

  const isPersian = i18n.language === 'fa';

  const [formData, setFormData] = useState({
    shipping_address: '',
    shipping_city: '',
    shipping_state: '',
    shipping_zip: '',
    shipping_country: isPersian ? 'IR' : 'US',
    shipping_phone: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        shipping_phone: prev.shipping_phone || user.phone || '',
        shipping_address: prev.shipping_address || user.address || '',
        shipping_city: prev.shipping_city || user.city || '',
        shipping_state: prev.shipping_state || user.province || '',
        shipping_zip: prev.shipping_zip || user.postal_code || '',
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'shipping_state' && formData.shipping_country === 'IR') {
      const selectedProv = IRANIAN_PROVINCES.find((p) => p.name === value || p.id === value);
      const cities = selectedProv ? selectedProv.cities : [];
      setFormData((prev) => ({
        ...prev,
        shipping_state: value,
        shipping_city: cities.length > 0 ? cities[0] : '',
      }));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.shipping_country === 'IR' || formData.shipping_phone.startsWith('09') || formData.shipping_phone.startsWith('+98')) {
      if (!validateIranianPhone(formData.shipping_phone)) {
        const msg = t('auth.invalidPhone', 'Please enter a valid phone number (e.g. 09123456789)');
        setError(msg);
        showError(msg);
        return;
      }
    }

    if (formData.shipping_country === 'IR' && !validateIranianPostalCode(formData.shipping_zip)) {
      const msg = t('checkout.invalidPostalCode', 'Postal code must be 10 digits');
      setError(msg);
      showError(msg);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiClient.post(ENDPOINTS.orderCreate, formData);
      await clearCart();
      success(t('checkout.orderSuccess', 'Order placed successfully!'));
      navigate(`/orders/${response.data.order_number}`);
    } catch (err) {
      const message = err.response?.data?.error || t('checkout.orderFailed');
      setError(message);
      showError(message);
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
      <h1>{t('checkout.title')}</h1>

      <div className="checkout-content">
        <form onSubmit={handleSubmit} className="checkout-form">
          <section className="form-section">
            <h2>{t('checkout.shippingInfo')}</h2>

            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              <label htmlFor="shipping_phone">{t('checkout.phone')} *</label>
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
              <label htmlFor="shipping_address">{t('checkout.address')} *</label>
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
                <label htmlFor="shipping_country">{t('checkout.country')} *</label>
                <select
                  id="shipping_country"
                  name="shipping_country"
                  value={formData.shipping_country}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="IR">ایران (Iran)</option>
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="UK">United Kingdom</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="shipping_state">{t('checkout.state')} *</label>
                {formData.shipping_country === 'IR' ? (
                  <select
                    id="shipping_state"
                    name="shipping_state"
                    value={formData.shipping_state}
                    onChange={handleChange}
                    required
                    className="form-input"
                  >
                    <option value="">{t('checkout.selectProvince', 'Select Province')}</option>
                    {IRANIAN_PROVINCES.map((prov) => (
                      <option key={prov.id} value={prov.name}>
                        {isPersian ? prov.name : prov.name_en}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    id="shipping_state"
                    name="shipping_state"
                    value={formData.shipping_state}
                    onChange={handleChange}
                    className="form-input"
                  />
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="shipping_city">{t('checkout.city')} *</label>
                {formData.shipping_country === 'IR' && formData.shipping_state ? (
                  <select
                    id="shipping_city"
                    name="shipping_city"
                    value={formData.shipping_city}
                    onChange={handleChange}
                    required
                    className="form-input"
                  >
                    <option value="">{t('checkout.selectCity', 'Select City')}</option>
                    {(IRANIAN_PROVINCES.find((p) => p.name === formData.shipping_state || p.id === formData.shipping_state)?.cities || []).map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    id="shipping_city"
                    name="shipping_city"
                    value={formData.shipping_city}
                    onChange={handleChange}
                    required
                    className="form-input"
                  />
                )}
              </div>

              <div className="form-group">
                <label htmlFor="shipping_zip">{t('checkout.zipCode')} *</label>
                <input
                  type="text"
                  id="shipping_zip"
                  name="shipping_zip"
                  value={formData.shipping_zip}
                  onChange={handleChange}
                  required
                  maxLength={10}
                  placeholder={formData.shipping_country === 'IR' ? '1234567890' : '10001'}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="notes">{t('checkout.orderNotes')}</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="form-input"
                rows={3}
                placeholder={t('checkout.notesPlaceholder')}
              />
            </div>
          </section>

          <button type="submit" disabled={loading} className="btn btn-primary btn-lg btn-full">
            {loading ? t('checkout.placingOrder') : (
              <span>
                {t('checkout.placeOrder')} - <Price amount={total} />
              </span>
            )}
          </button>
        </form>

        <div className="order-summary">
          <h2>{t('checkout.orderSummary')}</h2>

          <div className="summary-items">
            {cart.items.map((item) => (
              <div key={item.id} className="summary-item">
                <div className="item-info">
                  <span className="item-name">{item.product.name_localized || item.product.name}</span>
                  <span className="item-qty">x{item.quantity}</span>
                </div>
                <span className="item-price"><Price amount={item.subtotal} /></span>
              </div>
            ))}
          </div>

          <div className="summary-divider" />

          <div className="summary-row">
            <span>{t('checkout.subtotal')}</span>
            <span><Price amount={subtotal} /></span>
          </div>

          <div className="summary-row">
            <span>{t('checkout.shipping')}</span>
            <span>{shipping === 0 ? t('checkout.free') : <Price amount={shipping} />}</span>
          </div>

          <div className="summary-row total">
            <span>{t('checkout.total')}</span>
            <span><Price amount={total} /></span>
          </div>
        </div>
      </div>
    </div>
  );
}
