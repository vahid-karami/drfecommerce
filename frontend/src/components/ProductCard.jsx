import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFavorites } from '../context/FavoritesContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ProductQuickView from './ProductQuickView';
import Price from './Price';

export default function ProductCard({ product }) {
  const { isAuthenticated } = useAuth();
  const { toggleFavorite, isInFavorites } = useFavorites();
  const navigate = useNavigate();
  const [showQuickView, setShowQuickView] = useState(false);
  const hasDiscount = product.discount_price && product.discount_price < product.price;
  const isFavorite = isInFavorites(product.id);

  // Calculate percentage discount
  const calculateDiscountPercent = () => {
    if (!hasDiscount) return 0;
    const diff = product.price - product.effective_price;
    return Math.round((diff / product.price) * 100);
  };

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    await toggleFavorite(product.id);
  };

  return (
    <Link to={`/products/${product.slug}`} className="product-card digikala-card">
      <div className="product-card-image digikala-card-img">
        {product.primary_image ? (
          <img src={product.primary_image.image} alt={product.name} loading="lazy" />
        ) : (
          <div className="product-card-placeholder">
            <span>🏥</span>
          </div>
        )}
        
        {/* Discount Badge on Image */}
        {hasDiscount && (
          <span className="digikala-discount-badge">
            ٪ {calculateDiscountPercent()}
          </span>
        )}

        {/* Action Buttons overlay (Hover) */}
        <div className="card-hover-actions">
          <button
            onClick={handleFavoriteClick}
            className={`action-icon-btn ${isFavorite ? 'text-danger' : ''}`}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            title={isFavorite ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
          
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowQuickView(true);
            }}
            className="action-icon-btn"
            aria-label="Quick view"
            title="مشاهده سریع"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="product-card-content digikala-card-content">
        <h3 className="product-card-name clamped-title">{product.name}</h3>
        
        <div className="card-middle-row">
          <div className="product-rating">
            <span className="star-icon">⭐</span>
            <span className="rating-text">۴.۵</span>
          </div>
          {product.brand && <span className="product-card-brand">{product.brand}</span>}
        </div>

        <div className="product-card-price digikala-price-layout">
          {hasDiscount ? (
            <div className="price-row">
              <span className="price-original"><Price amount={product.price} showCurrency={false} /></span>
              <span className="price-sale"><Price amount={product.effective_price} /></span>
            </div>
          ) : (
            <div className="price-row">
               <span className="price-sale"><Price amount={product.effective_price} /></span>
            </div>
          )}
        </div>
        
        {!product.in_stock && (
          <div className="out-of-stock-overlay">
            <span>ناموجود</span>
          </div>
        )}
      </div>

      {showQuickView && (
        <ProductQuickView slug={product.slug} onClose={() => setShowQuickView(false)} />
      )}
    </Link>
  );
}
