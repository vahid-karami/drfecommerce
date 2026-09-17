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
    <div className="card product-card">
      <div className="product-image">
        <Skeleton style={{ width: '100%', height: '100%' }} />
      </div>
      <div className="card-body">
        <Skeleton style={{ width: '60%', height: '1rem', marginBottom: '0.5rem' }} />
        <Skeleton style={{ width: '40%', height: '0.875rem', marginBottom: '1rem' }} />
        <Skeleton style={{ width: '30%', height: '1.5rem' }} />
      </div>
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="product-detail-page">
      <div className="container">
        <Skeleton style={{ width: '200px', height: '1rem', marginBottom: '2rem' }} />
        <div className="product-main">
          <div className="product-gallery">
            <Skeleton style={{ width: '100%', height: '500px' }} />
          </div>
          <div className="product-info">
            <Skeleton style={{ width: '40%', height: '1rem', marginBottom: '1rem' }} />
            <Skeleton style={{ width: '80%', height: '2rem', marginBottom: '1rem' }} />
            <Skeleton style={{ width: '30%', height: '1.5rem', marginBottom: '2rem' }} />
            <Skeleton style={{ width: '100%', height: '100px', marginBottom: '2rem' }} />
            <Skeleton style={{ width: '200px', height: '3rem' }} />
          </div>
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
