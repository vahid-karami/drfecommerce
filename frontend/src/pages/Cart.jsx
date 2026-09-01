import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Cart() {
  const { cart, updateCartItem, removeFromCart, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="empty-state">
            <span className="empty-state-icon">🛒</span>
            <h3>Your cart is empty</h3>
            <p>Please login to view your cart</p>
            <Link to="/login" className="btn btn-primary">Sign In</Link>
          </div>
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
            <h3>Your cart is empty</h3>
            <p>Add some products to get started</p>
            <Link to="/products" className="btn btn-primary">Browse Products</Link>
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
        <h1>Shopping Cart</h1>

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
                  <p className="item-price">${item.product.effective_price}</p>
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
                  <span>${item.subtotal.toFixed(2)}</span>
                </div>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className="remove-btn"
                  aria-label="Remove item"
                >
                  ×
                </button>
              </div>
            ))}

            <div className="cart-actions">
              <button onClick={clearCart} className="btn btn-ghost btn-sm">
                Clear Cart
              </button>
              <Link to="/products" className="btn btn-outline btn-sm">
                Continue Shopping
              </Link>
            </div>
          </div>

          <div className="cart-summary">
            <h2>Order Summary</h2>

            <div className="summary-row">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>

            <div className="summary-row">
              <span>Shipping</span>
              <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
            </div>

            {shipping > 0 && (
              <p className="shipping-note">
                Add ${(100 - subtotal).toFixed(2)} more for free shipping
              </p>
            )}

            <div className="summary-row total">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="btn btn-primary btn-lg btn-full"
            >
              Proceed to Checkout
            </button>

            <div className="trust-badges">
              <span>🔒 Secure checkout</span>
              <span>🚚 Fast delivery</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
