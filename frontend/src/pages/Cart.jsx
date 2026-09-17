import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { CartSkeleton } from '../components/Skeletons';
import Price from '../components/Price';

export default function Cart() {
  const { t } = useTranslation();
  const { cart, updateCartItem, removeFromCart, clearCart, loading: cartLoading } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { success, error: showError } = useToast();

  const handleRemove = (itemId, productName) => {
    removeFromCart(itemId);
    showError(`${productName} removed from cart`);
  };

  const handleClear = () => {
    clearCart();
    success('Cart cleared');
  };

  if (!isAuthenticated) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="empty-state">
            <span className="empty-state-icon">🛒</span>
            <h3>{t('cart.emptyCart')}</h3>
            <p>{t('cart.addToCartFirst')}</p>
            <Link to="/login" className="btn btn-primary">{t('common.signIn')}</Link>
          </div>
        </div>
      </div>
    );
  }

  if (cartLoading) {
    return (
      <div className="cart-page">
        <div className="container">
          <CartSkeleton />
        </div>
      </div>
    );
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="empty-state">
            <span className="empty-state-icon">🛒</span>
            <h3>{t('cart.emptyCart')}</h3>
            <p>{t('cart.emptyCartDesc')}</p>
            <Link to="/products" className="btn btn-primary">{t('cart.browseProducts')}</Link>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = cart.total_price;
  const shipping = subtotal >= 100 ? 0 : 9.99;
  const total = subtotal + shipping;

  return (
    <div className="cart-page">
      <div className="container">
        <h1>{t('cart.shoppingCart')}</h1>

        <div className="cart-layout">
          <div className="cart-items">
            {cart.items.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="item-image">
                  {item.product.primary_image ? (
                    <img src={item.product.primary_image.image} alt={item.product.name} />
                  ) : (
                    <div className="image-placeholder">🏥</div>
                  )}
                </div>

                <div className="item-details">
                  <h3>
                    <Link to={`/products/${item.product.slug}`}>{item.product.name}</Link>
                  </h3>
                  {item.product.brand && (
                    <span className="item-brand">{item.product.brand}</span>
                  )}
                  <p className="item-price"><Price amount={item.product.effective_price} /></p>
                </div>

                <div className="item-quantity">
                  <button
                    onClick={() => updateCartItem(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="qty-btn"
                  >
                    −
                  </button>
                  <span className="qty-value">{item.quantity}</span>
                  <button
                    onClick={() => updateCartItem(item.id, item.quantity + 1)}
                    className="qty-btn"
                  >
                    +
                  </button>
                </div>

                <div className="item-subtotal">
                  <span><Price amount={item.subtotal} /></span>
                </div>

                <button
                  onClick={() => handleRemove(item.id, item.product.name)}
                  className="remove-btn"
                  aria-label="Remove item"
                >
                  ×
                </button>
              </div>
            ))}

            <div className="cart-actions">
              <button onClick={handleClear} className="btn btn-ghost btn-sm">
                {t('cart.clearCart')}
              </button>
              <Link to="/products" className="btn btn-outline btn-sm">
                {t('common.continueShopping')}
              </Link>
            </div>
          </div>

          <div className="cart-summary">
            <h2>{t('cart.orderSummary')}</h2>

            <div className="summary-row">
              <span>{t('cart.subtotal')}</span>
              <span><Price amount={subtotal} /></span>
            </div>

            <div className="summary-row">
              <span>{t('cart.shipping')}</span>
              <span>{shipping === 0 ? t('cart.free') : <Price amount={shipping} />}</span>
            </div>

            {shipping > 0 && (
              <p className="shipping-note">
                {t('cart.addMoreForFreeShipping', { amount: Math.max(0, 500000 - subtotal) })}
              </p>
            )}

            <div className="summary-row total">
              <span>{t('cart.total')}</span>
              <span><Price amount={total} /></span>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="btn btn-primary btn-lg btn-full"
            >
              {t('cart.proceedToCheckout')}
            </button>

            <div className="trust-badges">
              <span>🔒 {t('cart.secureCheckout')}</span>
              <span>🚚 {t('cart.fastDelivery')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
