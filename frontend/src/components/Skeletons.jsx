export function Skeleton({ className = '', style = {} }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={style}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="product-card" aria-hidden="true">
      <Skeleton className="product-card-media" style={{ aspectRatio: '1' }} />
      <div className="product-card-body">
        <Skeleton style={{ width: '35%', height: '0.75rem' }} />
        <Skeleton style={{ width: '85%', height: '1rem' }} />
        <Skeleton style={{ width: '45%', height: '1.1rem', marginTop: '0.25rem' }} />
      </div>
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="pdp" aria-hidden="true">
      <Skeleton style={{ width: '220px', height: '0.8rem', margin: '1.5rem 0 1.25rem' }} />
      <div className="pdp-main">
        <Skeleton className="pdp-stage" />
        <div className="pdp-info">
          <Skeleton style={{ width: '25%', height: '0.9rem', marginBottom: '1rem' }} />
          <Skeleton style={{ width: '80%', height: '2.2rem', marginBottom: '1rem' }} />
          <Skeleton style={{ width: '35%', height: '1rem', marginBottom: '2rem' }} />
          <Skeleton style={{ width: '100%', height: '120px', marginBottom: '2rem' }} />
          <Skeleton style={{ width: '100%', height: '52px', borderRadius: '999px' }} />
        </div>
      </div>
    </div>
  );
}

export function CartSkeleton() {
  return (
    <div className="cart-page" aria-hidden="true">
      <Skeleton style={{ width: '160px', height: '0.8rem', margin: '1.5rem 0 1.25rem' }} />
      <Skeleton style={{ width: '220px', height: '2.2rem', marginBottom: '2rem' }} />
      <div className="cart-layout">
        <ul className="cart-list">
          {[1, 2, 3].map((i) => (
            <li key={i} className="cart-row">
              <Skeleton className="cart-row-img" />
              <div className="cart-row-info">
                <Skeleton style={{ width: '70%', height: '1.1rem' }} />
                <Skeleton style={{ width: '35%', height: '0.9rem' }} />
              </div>
              <Skeleton style={{ width: '110px', height: '42px', borderRadius: '999px' }} />
            </li>
          ))}
        </ul>
        <Skeleton className="summary-card" style={{ height: '320px' }} />
      </div>
    </div>
  );
}
