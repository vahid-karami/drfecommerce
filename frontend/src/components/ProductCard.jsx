import { Link } from 'react-router-dom';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const hasDiscount = product.discount_price && product.discount_price < product.price;

  return (
    <Link to={`/products/${product.slug}`} className="product-card">
      <div className="product-image">
        {product.primary_image ? (
          <img src={product.primary_image.image} alt={product.name} />
        ) : (
          <div className="placeholder-image">🏥</div>
        )}
        {hasDiscount && <span className="discount-badge">SALE</span>}
      </div>
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-brand">{product.brand}</p>
        <div className="product-price">
          {hasDiscount ? (
            <>
              <span className="original-price">${product.price}</span>
              <span className="sale-price">${product.effective_price}</span>
            </>
          ) : (
            <span className="price">${product.effective_price}</span>
          )}
        </div>
        <p className={`stock-status ${product.in_stock ? 'in-stock' : 'out-of-stock'}`}>
          {product.in_stock ? 'In Stock' : 'Out of Stock'}
        </p>
      </div>
    </Link>
  );
}
