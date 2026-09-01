import { Link } from 'react-router-dom';
import { useFavorites } from '../context/FavoritesContext';
import ProductCard from '../components/ProductCard';

export default function Favorites() {
  const { favorites, removeFromFavorites, clearFavorites } = useFavorites();

  if (!favorites.items || favorites.items.length === 0) {
    return (
      <div className="favorites-page">
        <div className="container">
          <div className="empty-state">
            <span className="empty-state-icon">♡</span>
            <h3>Your favorites list is empty</h3>
            <p>Save products you love to find them later</p>
            <Link to="/products" className="btn btn-primary">Browse Products</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="favorites-page">
      <div className="container">
        <div className="favorites-header">
          <h1>My Favorites</h1>
          <button onClick={clearFavorites} className="btn btn-ghost btn-sm">
            Clear All
          </button>
        </div>

        <div className="products-grid">
          {favorites.items.map((item) => (
            <div key={item.id} className="favorite-item">
              <ProductCard product={item.product} />
              <button
                onClick={() => removeFromFavorites(item.product.id)}
                className="remove-favorite-btn"
                aria-label="Remove from favorites"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
