import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const { cart } = useCart();
  const { favorites } = useFavorites();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header-utility-bar">
        <div className="container utility-content">
          <span>Free shipping on orders over $100</span>
          <span>Expert support available</span>
        </div>
      </div>

      <div className="header-main">
        <div className="container header-content">
          <Link to="/" className="header-logo">
            <span className="logo-mark">SM</span>
            <span className="logo-text">SportMed</span>
          </Link>

          <nav className="header-nav">
            <Link to="/products" className="nav-link">Shop</Link>
            <div className="nav-dropdown">
              <span className="nav-link">Shop by Body Part</span>
              <div className="dropdown-menu">
                <Link to="/products?injury_type=knee">Knee</Link>
                <Link to="/products?injury_type=ankle">Ankle</Link>
                <Link to="/products?injury_type=back">Back</Link>
                <Link to="/products?injury_type=shoulder">Shoulder</Link>
                <Link to="/products?injury_type=wrist">Wrist</Link>
                <Link to="/products?injury_type=elbow">Elbow</Link>
              </div>
            </div>
            <Link to="/categories" className="nav-link">Categories</Link>
          </nav>

          <div className="header-actions">
            <Link to="/products" className="icon-button" aria-label="Search">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.3-4.3"/>
              </svg>
            </Link>

            {isAuthenticated ? (
              <>
                <Link to="/favorites" className="icon-button" aria-label="Favorites">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                  {favorites.total_items > 0 && (
                    <span className="cart-badge">{favorites.total_items}</span>
                  )}
                </Link>
                <Link to="/profile" className="icon-button" aria-label="Account">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </Link>
                <button onClick={handleLogout} className="btn btn-ghost btn-sm">
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="btn btn-ghost btn-sm">
                Sign In
              </Link>
            )}

            <Link to="/cart" className="icon-button cart-button" aria-label="Cart">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
                <path d="M3 6h18"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              {cart.total_items > 0 && (
                <span className="cart-badge">{cart.total_items}</span>
              )}
            </Link>

            <button
              className="mobile-menu-button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {mobileMenuOpen ? (
                  <path d="M18 6 6 18M6 6l12 12"/>
                ) : (
                  <>
                    <path d="M3 12h18"/>
                    <path d="M3 6h18"/>
                    <path d="M3 18h18"/>
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="mobile-menu">
          <nav className="mobile-nav">
            <Link to="/products" onClick={() => setMobileMenuOpen(false)}>Shop All</Link>
            <Link to="/categories" onClick={() => setMobileMenuOpen(false)}>Categories</Link>
            <Link to="/favorites" onClick={() => setMobileMenuOpen(false)}>My Favorites</Link>
            <Link to="/orders" onClick={() => setMobileMenuOpen(false)}>My Orders</Link>
            <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>My Account</Link>
          </nav>
        </div>
      )}
    </header>
  );
}
