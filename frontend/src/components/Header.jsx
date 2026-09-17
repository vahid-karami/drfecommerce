import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';

export default function Header() {
  const { t } = useTranslation();
  const { isAuthenticated, logout, user } = useAuth();
  const { cart } = useCart();
  const { favorites } = useFavorites();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="header">
      {/* Top Banner Add-on (Optional, mostly for app download promo) */}
      
      {/* Main Header Row */}
      <div className="header-main">
        <div className="container header-content digikala-style-header">
          
          <div className="header-right-section">
            <Link to="/" className="header-logo">
              <span className="logo-mark">SM</span>
              <span className="logo-text">SportMed</span>
            </Link>

            {/* Search Bar */}
            <div className="header-search-container">
              <form className="header-search-form" onSubmit={handleSearchSubmit}>
                <button type="submit" className="search-icon-btn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="m21 21-4.3-4.3"/>
                  </svg>
                </button>
                <input 
                  type="text" 
                  className="search-input"
                  placeholder={t('common.search') + '...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
            </div>
          </div>

          <div className="header-actions">
            {/* User Account Menu / Login Button */}
            {isAuthenticated ? (
              <div className="nav-dropdown user-dropdown">
                <button className="btn btn-outline btn-account">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  {user?.first_name || user?.username || t('common.profile')}
                </button>
                <div className="dropdown-menu">
                  <Link to="/profile" className="dropdown-item">{t('header.myAccount')}</Link>
                  <Link to="/orders" className="dropdown-item">{t('header.myOrders')}</Link>
                  <Link to="/favorites" className="dropdown-item">{t('header.myFavorites')} ({favorites.total_items})</Link>
                  <button onClick={handleLogout} className="dropdown-item text-danger text-right w-full">
                    {t('common.logout')}
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="btn btn-outline btn-account">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                  <polyline points="10 17 15 12 10 7"/>
                  <line x1="15" y1="12" x2="3" y2="12"/>
                </svg>
                {t('common.signIn')} | ثبت‌نام
              </Link>
            )}

            {/* Cart Split Divider */}
            <div className="header-divider"></div>

            <Link to="/cart" className="icon-button cart-button" aria-label={t('common.cart')}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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

      {/* Secondary Nav Bar (Categories) */}
      <div className="header-bottom-nav">
        <div className="container nav-container">
          <div className="nav-dropdown category-mega-menu">
            <span className="nav-link main-category-trigger">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-2">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
              دسته‌بندی کالاها
            </span>
            <div className="dropdown-menu">
              <Link to="/products?injury_type=knee">{t('bodyParts.knee')}</Link>
              <Link to="/products?injury_type=ankle">{t('bodyParts.ankle')}</Link>
              <Link to="/products?injury_type=back">{t('bodyParts.back')}</Link>
              <Link to="/products?injury_type=shoulder">{t('bodyParts.shoulder')}</Link>
              <Link to="/products?injury_type=wrist">{t('bodyParts.wrist')}</Link>
              <Link to="/products?injury_type=elbow">{t('bodyParts.elbow')}</Link>
            </div>
          </div>
          
          <nav className="secondary-links">
            <Link to="/products?discount=true" className="nav-link highlight">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-1">
                <path d="m11 2 2 2-2 2-4-4Z"/>
                <path d="M22 12.5v-3a2 2 0 0 0-2-2h-3l-2-2-2 2h-3a2 2 0 0 0-2 2v3l-2 2 2 2v3a2 2 0 0 0 2 2h3l2 2 2-2h3a2 2 0 0 0 2-2v-3l2-2Z"/>
              </svg>
              پیشنهاد شگفت‌انگیز
            </Link>
            <Link to="/products" className="nav-link">{t('common.shop')}</Link>
            <Link to="/categories" className="nav-link">{t('header.categories')}</Link>
            <Link to="#" className="nav-link">پرفروش‌ترین‌ها</Link>
            <Link to="#" className="nav-link">سوالی دارید؟</Link>
          </nav>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="mobile-menu">
          <nav className="mobile-nav">
            <Link to="/products" onClick={() => setMobileMenuOpen(false)}>{t('common.shop')}</Link>
            <Link to="/categories" onClick={() => setMobileMenuOpen(false)}>{t('header.categories')}</Link>
            <Link to="/favorites" onClick={() => setMobileMenuOpen(false)}>{t('header.myFavorites')}</Link>
            <Link to="/orders" onClick={() => setMobileMenuOpen(false)}>{t('header.myOrders')}</Link>
            <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>{t('header.myAccount')}</Link>
          </nav>
        </div>
      )}
    </header>
  );
}
