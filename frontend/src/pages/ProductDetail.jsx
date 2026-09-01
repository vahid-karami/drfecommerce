import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './ProductDetail.css';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const [productRes, reviewsRes] = await Promise.all([
          apiClient.get(ENDPOINTS.productDetail(slug)),
          apiClient.get(ENDPOINTS.productReviews(slug)),
        ]);
        setProduct(productRes.data);
        setReviews(reviewsRes.data);
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
      navigate('/login');
      return;
    }
    setAddingToCart(true);
    try {
      await addToCart(product.id, quantity);
      alert('Added to cart!');
    } catch (error) {
      alert('Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!product) {
    return <div className="error">Product not found</div>;
  }

  const hasDiscount = product.discount_price && product.discount_price < product.price;

  return (
    <div className="product-detail">
      <div className="product-main">
        <div className="product-gallery">
          {product.images && product.images.length > 0 ? (
            <div className="main-image">
              <img
                src={product.images.find((img) => img.is_primary)?.image || product.images[0].image}
                alt={product.name}
              />
            </div>
          ) : (
            <div className="main-image placeholder">🏥</div>
          )}
        </div>

        <div className="product-info">
          <h1>{product.name}</h1>
          <p className="brand">Brand: {product.brand}</p>

          <div className="price-section">
            {hasDiscount ? (
              <>
                <span className="original-price">${product.price}</span>
                <span className="sale-price">${product.effective_price}</span>
                <span className="discount-percent">
                  {Math.round((1 - product.discount_price / product.price) * 100)}% OFF
                </span>
              </>
            ) : (
              <span className="price">${product.effective_price}</span>
            )}
          </div>

          <div className="product-meta">
            <p><strong>Injury Type:</strong> {product.injury_type}</p>
            {product.size && <p><strong>Size:</strong> {product.size}</p>}
            {product.color && <p><strong>Color:</strong> {product.color}</p>}
            {product.material && <p><strong>Material:</strong> {product.material}</p>}
          </div>

          <div className="stock-info">
            {product.in_stock ? (
              <span className="in-stock">✓ In Stock ({product.stock} available)</span>
            ) : (
              <span className="out-of-stock">✗ Out of Stock</span>
            )}
          </div>

          {product.in_stock && (
            <div className="add-to-cart-section">
              <div className="quantity-selector">
                <label>Quantity:</label>
                <div className="quantity-controls">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="qty-btn"
                  >
                    -
                  </button>
                  <span className="qty-value">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="qty-btn"
                  >
                    +
                  </button>
                </div>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={addingToCart}
                className="btn btn-primary btn-lg"
              >
                {addingToCart ? 'Adding...' : 'Add to Cart'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="product-description">
        <h2>Description</h2>
        <p>{product.description}</p>
      </div>

      <div className="product-reviews">
        <h2>Customer Reviews ({reviews.length})</h2>
        {reviews.length > 0 ? (
          <div className="reviews-list">
            {reviews.map((review) => (
              <div key={review.id} className="review-card">
                <div className="review-header">
                  <span className="review-author">
                    {review.user.first_name || review.user.phone}
                    {review.is_verified_purchase && (
                      <span className="verified-badge">✓ Verified</span>
                    )}
                  </span>
                  <span className="review-rating">
                    {'★'.repeat(review.rating)}
                    {'☆'.repeat(5 - review.rating)}
                  </span>
                </div>
                <h4>{review.title}</h4>
                <p>{review.comment}</p>
                <span className="review-date">
                  {new Date(review.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-reviews">No reviews yet. Be the first to review this product!</p>
        )}
      </div>
    </div>
  );
}
