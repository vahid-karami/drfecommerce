import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import apiClient from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ProductDetailSkeleton } from '../components/Skeletons';
import { usePageMeta, ProductSchema } from '../utils/seo';
import Price from '../components/Price';

export default function ProductDetail() {
  const { t } = useTranslation();
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { success, error: showError } = useToast();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  usePageMeta({
    title: product ? (product.name_localized || product.name) : '',
    description: product ? (product.description_localized || product.description) : '',
    image: product?.images?.[0]?.image,
  });
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const [productRes, reviewsRes] = await Promise.all([
          apiClient.get(ENDPOINTS.productDetail(slug)),
          apiClient.get(ENDPOINTS.productReviews(slug)),
        ]);
        setProduct(productRes.data);
        setReviews(reviewsRes.data);
        if (productRes.data.size) {
          setSelectedSize(productRes.data.size);
        }
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
      success(t('cart.addedToCart'));
    } catch {
      showError(t('cart.addFailed'));
    } finally {
      setAddingToCart(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      await apiClient.post(ENDPOINTS.reviewCreate(slug), reviewForm);
      const reviewsRes = await apiClient.get(ENDPOINTS.productReviews(slug));
      setReviews(reviewsRes.data);
      setReviewForm({ rating: 5, title: '', comment: '' });
      success('Review submitted successfully');
    } catch (error) {
      showError(error.response?.data?.error || t('product.reviewFailed'));
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="container">
          <ProductDetailSkeleton />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="error-state">
        <h2>{t('product.notFound')}</h2>
        <Link to="/products" className="btn btn-primary">{t('cart.browseProducts')}</Link>
      </div>
    );
  }

  const hasDiscount = product.discount_price && product.discount_price < product.price;
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="product-detail-page">
      <ProductSchema product={product} />
      <div className="container">
        <nav className="breadcrumb">
          <Link to="/">{t('common.home')}</Link>
          <span>/</span>
          <Link to="/products">{t('common.products')}</Link>
          <span>/</span>
          <span>{product.name_localized || product.name}</span>
        </nav>

        <div className="product-main">
          <div className="product-gallery">
            <div className="main-image">
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[activeImage]?.image || product.images[0].image}
                  alt={product.name_localized || product.name}
                />
              ) : (
                <div className="image-placeholder">🏥</div>
              )}
            </div>
            {product.images && product.images.length > 1 && (
              <div className="thumbnail-list">
                {product.images.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImage(idx)}
                    className={`thumbnail ${idx === activeImage ? 'active' : ''}`}
                  >
                    <img src={img.image} alt={img.alt_text || product.name} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="product-info">
            {product.brand && (
              <span className="product-brand">{product.brand}</span>
            )}
            <h1>{product.name_localized || product.name}</h1>

            {avgRating && (
              <div className="product-rating">
                <span className="stars">{'★'.repeat(Math.round(avgRating))}{'☆'.repeat(5 - Math.round(avgRating))}</span>
                <span>{avgRating}</span>
                <span className="review-count">({t('product.reviewsCount', { count: reviews.length })})</span>
              </div>
            )}

            <div className="product-price">
              {hasDiscount ? (
                <>
                  <span className="price-original"><Price amount={product.price} /></span>
                  <span className="price-sale"><Price amount={product.effective_price} /></span>
                  <span className="discount-badge">
                    {t('product.savePercent', { percent: Math.round((1 - product.discount_price / product.price) * 100) })}
                  </span>
                </>
              ) : (
                <Price amount={product.effective_price} />
              )}
            </div>

            <p className="product-short-desc">{product.description_localized || product.description}</p>

            {product.size && (
              <div className="option-group">
                <label className="option-label">{t('product.size')}</label>
                <div className="size-options">
                  <button
                    type="button"
                    onClick={() => setSelectedSize(product.size)}
                    className={`size-btn ${selectedSize === product.size ? 'active' : ''}`}
                  >
                    {product.size}
                  </button>
                </div>
                <button onClick={() => setShowSizeGuide(true)} className="size-guide-link">
                  {t('product.sizeGuide')}
                </button>
              </div>
            )}

            <div className="stock-status">
              {product.in_stock ? (
                <span className="in-stock">✓ {t('common.inStock')} ({product.stock})</span>
              ) : (
                <span className="out-of-stock">✗ {t('common.outOfStock')}</span>
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
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className="btn btn-primary btn-lg"
                >
                  {addingToCart ? t('common.loading') : t('common.addToCart')}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="product-details">
          <div className="details-section">
            <h2>{t('product.productOverview')}</h2>
            <p>{product.description}</p>
          </div>

          {(product.material || product.weight) && (
            <div className="details-section">
              <h2>{t('product.specifications')}</h2>
              <div className="specs-grid">
                {product.material && (
                  <div className="spec-item">
                    <span className="spec-label">{t('product.material')}</span>
                    <span className="spec-value">{product.material}</span>
                  </div>
                )}
                {product.weight && (
                  <div className="spec-item">
                    <span className="spec-label">{t('product.weight')}</span>
                    <span className="spec-value">{product.weight}g</span>
                  </div>
                )}
                {product.color && (
                  <div className="spec-item">
                    <span className="spec-label">{t('product.color')}</span>
                    <span className="spec-value">{product.color}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="reviews-section">
          <h2>{t('product.customerReviews')} ({reviews.length})</h2>

          {reviews.length > 0 ? (
            <div className="reviews-list">
              {reviews.map((review) => (
                <div key={review.id} className="review-card">
                  <div className="review-header">
                    <div className="review-author">
                      <span className="author-name">
                        {review.user.first_name || review.user.phone}
                      </span>
                      {review.is_verified_purchase && (
                        <span className="verified-badge">{t('product.verifiedPurchase')}</span>
                      )}
                    </div>
                    <span className="review-date">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="review-rating">
                    {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                  </div>
                  <h4>{review.title}</h4>
                  <p>{review.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-reviews">{t('product.noReviews')}</p>
          )}

          {isAuthenticated && (
            <form onSubmit={handleSubmitReview} className="review-form">
              <h3>{t('product.writeReview')}</h3>
              <div className="form-group">
                <label className="form-label">{t('product.rating')}</label>
                <div className="rating-input">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      className={`star-btn ${star <= reviewForm.rating ? 'active' : ''}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">{t('product.title')}</label>
                <input
                  type="text"
                  value={reviewForm.title}
                  onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">{t('product.review')}</label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  className="form-textarea"
                  rows={4}
                  required
                />
              </div>
              <button type="submit" disabled={submittingReview} className="btn btn-primary">
                {submittingReview ? t('common.loading') : t('product.submitReview')}
              </button>
            </form>
          )}
        </div>
      </div>

      {showSizeGuide && (
        <div className="modal-overlay" onClick={() => setShowSizeGuide(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t('product.sizeGuide')}</h2>
              <button onClick={() => setShowSizeGuide(false)} className="modal-close">×</button>
            </div>
            <div className="modal-body">
              <p>{t('product.sizeGuideDesc')}</p>
              <table className="size-table">
                <thead>
                  <tr>
                    <th>{t('product.size')}</th>
                    <th>{t('product.measurement')}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>S</td><td>12-14 inches</td></tr>
                  <tr><td>M</td><td>14-16 inches</td></tr>
                  <tr><td>L</td><td>16-18 inches</td></tr>
                  <tr><td>XL</td><td>18-20 inches</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
