import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Cart.css';

export default function Cart() {
  const { cart, updateCartItem, removeFromCart, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return (
      <div className="cart-page">
        <div className="empty-cart">
          <span className="empty-icon">🛒</span>
          <h2>Your cart is empty</h2>
          <p>Please login to view your cart</p>
          <Link to="/login" className="btn btn-primary">Login</Link>
        </div>
      </div>
    );
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="cart-page">
        <div className="empty-cart">
          <span className="empty-icon">🛒</span>
          <h2>Your cart is empty</h2>
          <p>Add some products to get started</p>
          <Link to="/products" className="btn btn-primary">Browse Products</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1>Shopping Cart</h1>

      <div className="cart-content">
        <div className="cart-items">
          {cart.items.map((item) => (
            <div key={item.id} className="cart-item">
              <div className="item-image">
                {item.product.primary_image ? (
                  <img src={item.product.primary_image.image} alt={item.product.name} />
                ) : (
                  <div className="placeholder">🏥</div>
                )}
              </div>

              <div className="item-details">
                <h3>
                  <Link to={`/products/${item.product.slug}`}>{item.product.name}</Link>
                </h3>
                <p className="item-price">${item.product.effective_price}</p>
              </div>

              <div className="item-quantity">
                <button
                  onClick={() => updateCartItem(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  className="qty-btn"
                >
                  -
                </button>
                <span>{item.quantity}</span>
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
              >
                ✕
              </button>
            </div>
          ))}

          <button onClick={clearCart} className="btn btn-outline btn-sm clear-btn">
            Clear Cart
          </button>
        </div>

        <div className="cart-summary">
          <h2>Order Summary</h2>

          <div className="summary-row">
            <span>Subtotal</span>
            <span>${cart.total_price.toFixed(2)}</span>
          </div>

          <div className="summary-row">
            <span>Shipping</span>
            <span>{cart.total_price >= 100 ? 'Free' : '$9.99'}</span>
          </div>

          <div className="summary-row total">
            <span>Total</span>
            <span>
              ${(cart.total_price + (cart.total_price >= 100 ? 0 : 9.99)).toFixed(2)}
            </span>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="btn btn-primary btn-lg btn-full"
          >
            Proceed to Checkout
          </button>

          <Link to="/products" className="continue-shopping">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
