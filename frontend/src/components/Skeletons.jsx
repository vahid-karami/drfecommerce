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
    <div className="cart-page">
      <div className="container">
        <Skeleton style={{ width: '200px', height: '2rem', marginBottom: '2rem' }} />
        <div className="cart-layout">
          <div className="cart-items">
            {[1, 2, 3].map((i) => (
              <div key={i} className="cart-item">
                <Skeleton style={{ width: '120px', height: '120px' }} />
                <div className="cart-item-details">
                  <Skeleton style={{ width: '200px', height: '1.25rem', marginBottom: '0.5rem' }} />
                  <Skeleton style={{ width: '100px', height: '1rem' }} />
                </div>
                <Skeleton style={{ width: '80px', height: '2rem' }} />
              </div>
            ))}
          </div>
          <div className="cart-summary">
            <Skeleton style={{ width: '100%', height: '300px' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function OrderSkeleton() {
  return (
    <div className="orders-page">
      <div className="container">
        <Skeleton style={{ width: '200px', height: '2rem', marginBottom: '2rem' }} />
        {[1, 2, 3].map((i) => (
          <div key={i} className="order-card">
            <div className="order-header">
              <Skeleton style={{ width: '150px', height: '1.25rem' }} />
              <Skeleton style={{ width: '100px', height: '1rem' }} />
            </div>
            <div className="order-body">
              {[1, 2].map((j) => (
                <div key={j} className="order-item">
                  <Skeleton style={{ width: '60px', height: '60px' }} />
                  <div className="order-item-details">
                    <Skeleton style={{ width: '180px', height: '1rem', marginBottom: '0.5rem' }} />
                    <Skeleton style={{ width: '80px', height: '0.875rem' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
