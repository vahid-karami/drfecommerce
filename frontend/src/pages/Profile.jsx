import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatDate } from '../utils/persianDate';
import {
  IRANIAN_PROVINCES,
  validateIranianPostalCode,
} from '../utils/iranianAddress';

export default function Profile() {
  const { t, i18n } = useTranslation();
  const { user, updateProfile, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    address: '',
    province: '',
    city: '',
    postal_code: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        address: user.address || '',
        province: user.province || '',
        city: user.city || '',
        postal_code: user.postal_code || '',
      });
    }
  }, [user, isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'province') {
      const selectedProv = IRANIAN_PROVINCES.find((p) => p.name === value || p.id === value);
      const cities = selectedProv ? selectedProv.cities : [];
      setFormData((prev) => ({
        ...prev,
        province: value,
        city: cities.length > 0 ? cities[0] : '',
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.postal_code && !validateIranianPostalCode(formData.postal_code)) {
      const errMsg = t('checkout.invalidPostalCode', 'Postal code must be 10 digits');
      setMessage(errMsg);
      showError(errMsg);
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      await updateProfile(formData);
      success(t('profile.updateSuccess'));
    } catch (error) {
      const errorMessage = error.response?.data?.error || t('profile.updateFailed');
      setMessage(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="profile-page">
      <h1>{t('profile.myProfile')}</h1>

      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-header">
            <div className="avatar">
              {user?.first_name ? user.first_name[0].toUpperCase() : user?.phone[0]}
            </div>
            <div className="profile-info">
              <h2>{user?.first_name} {user?.last_name}</h2>
              <p>{user?.phone}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="profile-form">
            {message && (
              <div className={`message ${message.includes('success') || message.includes('موفق') ? 'success' : 'error'}`}>
                {message}
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="first_name">{t('auth.firstName')}</label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="last_name">{t('auth.lastName')}</label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="province">{t('checkout.state', 'Province')}</label>
                <select
                  id="province"
                  name="province"
                  value={formData.province}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="">{t('checkout.selectProvince', 'Select Province')}</option>
                  {IRANIAN_PROVINCES.map((prov) => (
                    <option key={prov.id} value={prov.name}>
                      {i18n.language === 'fa' ? prov.name : prov.name_en}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="city">{t('checkout.city', 'City')}</label>
                {formData.province ? (
                  <select
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="form-input"
                  >
                    <option value="">{t('checkout.selectCity', 'Select City')}</option>
                    {(IRANIAN_PROVINCES.find((p) => p.name === formData.province || p.id === formData.province)?.cities || []).map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="form-input"
                  />
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="address">{t('checkout.address', 'Address')}</label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="form-input"
                rows={3}
              />
            </div>

            <div className="form-group">
              <label htmlFor="postal_code">{t('checkout.zipCode', 'Postal Code')}</label>
              <input
                type="text"
                id="postal_code"
                name="postal_code"
                value={formData.postal_code}
                onChange={handleChange}
                maxLength={10}
                placeholder="1234567890"
                className="form-input"
              />
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? t('common.loading') : t('profile.saveChanges')}
            </button>
          </form>
        </div>

        <div className="profile-sidebar">
          <div className="sidebar-card">
            <h3>{t('profile.quickLinks')}</h3>
            <Link to="/orders" className="sidebar-link">
              <span>📦</span> {t('header.myOrders')}
            </Link>
            <Link to="/cart" className="sidebar-link">
              <span>🛒</span> {t('common.cart')}
            </Link>
          </div>

          <div className="sidebar-card">
            <h3>{t('profile.accountDetails')}</h3>
            <div className="detail-row">
              <span>{t('auth.phoneNumber')}</span>
              <span>{user?.phone}</span>
            </div>
            <div className="detail-row">
              <span>{t('profile.memberSince')}</span>
              <span>{formatDate(user?.date_joined, i18n.language)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
