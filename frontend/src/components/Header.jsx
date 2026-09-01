import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Header.css';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <span className="logo-icon">🏥</span>
          <span className="logo-text">SportMed Shop</span>
        </Link>

        <nav className="nav">
          <Link to="/products" className="nav-link">Products</Link>
          <Link to="/categories" className="nav-link">Categories</Link>
        </nav>

        <div className="header-actions">
          <Link to="/cart" className="cart-link">
            🛒 Cart
            {cart.total_items > 0 && (
              <span className="cart-badge">{cart.total_items}</span>
            )}
          </Link>

          {isAuthenticated ? (
            <div className="user-menu">
              <Link to="/profile" className="nav-link">
                {user?.first_name || user?.phone}
              </Link>
              <button onClick={handleLogout} className="btn btn-outline">
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="btn btn-primary">Register</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
