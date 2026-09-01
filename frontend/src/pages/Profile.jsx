import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';
import { ENDPOINTS } from '../api/endpoints';


export default function Profile() {
  const { user, updateProfile, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
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
      });
    }
  }, [user, isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await updateProfile(formData);
      setMessage('Profile updated successfully!');
    } catch (error) {
      setMessage('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="profile-page">
      <h1>My Profile</h1>

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
              <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
                {message}
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="first_name">First Name</label>
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
                <label htmlFor="last_name">Last Name</label>
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

            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        <div className="profile-sidebar">
          <div className="sidebar-card">
            <h3>Quick Links</h3>
            <Link to="/orders" className="sidebar-link">
              <span>📦</span> My Orders
            </Link>
            <Link to="/cart" className="sidebar-link">
              <span>🛒</span> Shopping Cart
            </Link>
          </div>

          <div className="sidebar-card">
            <h3>Account Details</h3>
            <div className="detail-row">
              <span>Phone</span>
              <span>{user?.phone}</span>
            </div>
            <div className="detail-row">
              <span>Member Since</span>
              <span>{new Date(user?.date_joined).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
