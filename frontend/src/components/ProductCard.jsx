import { Link } from 'react-router-dom';
import { useFavorites } from '../context/FavoritesContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function ProductCard({ product }) {
  const { isAuthenticated } = useAuth();
  const { toggleFavorite, isInFavorites } = useFavorites();
  const navigate = useNavigate();
  const hasDiscount = product.discount_price && product.discount_price < product.price;
  const isFavorite = isInFavorites(product.id);

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
    <Link to={`/products/${product.slug}`} className="product-card">
      <div className="product-card-image">
        {product.primary_image ? (
          <img src={product.primary_image.image} alt={product.name} loading="lazy" />
        ) : (
          <div className="product-card-placeholder">
            <span>🏥</span>
          </div>
        )}
        {hasDiscount && <span className="product-card-badge">Sale</span>}
        <button
          onClick={handleFavoriteClick}
          className={`favorite-btn ${isFavorite ? 'active' : ''}`}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          {isFavorite ? '♥' : '♡'}
        </button>
      </div>
      <div className="product-card-content">
        {product.brand && (
          <span className="product-card-brand">{product.brand}</span>
        )}
        <h3 className="product-card-name">{product.name}</h3>
        <div className="product-card-price">
          {hasDiscount ? (
            <>
              <span className="price-original">${product.price}</span>
              <span className="price-sale">${product.effective_price}</span>
            </>
          ) : (
            <span className="price">${product.effective_price}</span>
          )}
        </div>
        <div className="product-card-footer">
          <span className={`stock-badge ${product.in_stock ? 'in-stock' : 'out-of-stock'}`}>
            {product.in_stock ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>
      </div>
    </Link>
  );
}
