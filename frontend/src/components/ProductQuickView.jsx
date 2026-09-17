import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import apiClient from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Price from './Price';

export default function ProductQuickView({ slug, onClose }) {
  const { t } = useTranslation();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await apiClient.get(ENDPOINTS.productDetail(slug));
        setProduct(response.data);
      } catch (error) {
        console.error('Failed to fetch product:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    try {
      await addToCart(product.id, quantity);
      onClose();
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  if (!onClose) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Quick View</h2>
          <button onClick={onClose} className="modal-close">&times;</button>
        </div>
        <div className="modal-body">
          {loading ? (
            <div className="loading">
              <div className="spinner" />
            </div>
          ) : product ? (
            <div className="quick-view-content">
              <div className="quick-view-image">
                {product.images && product.images.length > 0 ? (
                  <img src={product.images[0].image} alt={product.name} />
                ) : (
                  <div className="image-placeholder">🏥</div>
                )}
              </div>
              <div className="quick-view-info">
                {product.brand && (
                  <span className="product-brand">{product.brand}</span>
                )}
                <h3>{product.name_localized || product.name}</h3>
                <p className="product-description">{product.description_localized || product.description}</p>
                <div className="product-price">
                  <Price amount={product.effective_price} />
                  {product.discount_price && product.discount_price < product.price && (
                    <span className="price-original"><Price amount={product.price} /></span>
                  )}
                </div>
                <div className="stock-status">
                  {product.in_stock ? (
                    <span className="in-stock">✓ {t('products.inStock', 'In Stock')} ({product.stock})</span>
                  ) : (
                    <span className="out-of-stock">✗ {t('products.outOfStock', 'Out of Stock')}</span>
                  )}
                </div>
                {product.in_stock && (
                  <div className="purchase-section">
                    <div className="quantity-selector">
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="qty-btn"
                      >
                        −
                      </button>
                      <span className="qty-value">{quantity}</span>
                      <button
                        onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                        className="qty-btn"
                      >
                        +
                      </button>
                    </div>
                    <button onClick={handleAddToCart} className="btn btn-primary btn-lg btn-full">
                      {t('cart.addToCart', 'Add to Cart')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="error-state">
              <h2>{t('product.notFound', 'Product not found')}</h2>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
