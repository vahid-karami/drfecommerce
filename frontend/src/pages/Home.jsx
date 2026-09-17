import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import apiClient from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const { t } = useTranslation();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [discountedProducts, setDiscountedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const [featuredRes, allRes] = await Promise.all([
          apiClient.get(ENDPOINTS.products, { params: { is_featured: 'true' } }),
          apiClient.get(ENDPOINTS.products)
        ]);
        setFeaturedProducts(featuredRes.data.results.slice(0, 4));
        
        // Find discounted products for Incredible Offers
        const discounted = allRes.data.results
          .filter(p => p.discount_price !== null)
          .slice(0, 6);
        setDiscountedProducts(discounted.length > 0 ? discounted : allRes.data.results.slice(0, 6));
        
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch home products:', error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const circleCategories = [
    { id: 'knee', name: 'زانوبند', icon: '🦵', query: 'knee' },
    { id: 'ankle', name: 'مچ‌بند پا', icon: '🦶', query: 'ankle' },
    { id: 'back', name: 'کمربند طبی', icon: '🧘', query: 'back' },
    { id: 'shoulder', name: 'شانه و گردن', icon: '💪', query: 'shoulder' },
    { id: 'wrist', name: 'مچ‌بند دست', icon: '✋', query: 'wrist' },
    { id: 'compression', name: 'پوشاک فشاری', icon: '🎽', query: 'general' },
  ];

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="home digikala-home">
      {/* Hero Banner Slider */}
      <section className="hero digikala-hero" style={{
        background: `linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.7) 100%), url('https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1920&h=800&fit=crop') center/cover`,
      }}>
        <div className="container">
          <div className="hero-content text-center">
            <span className="hero-badge badge-ruby">تجهیزات تخصصی آسیب‌های ورزشی</span>
            <h1 className="hero-title">بازگشت قدرتمند به ورزش</h1>
            <p className="hero-subtitle">انواع ساپورت‌های ارتوپدی و ورزشی با استانداردهای پزشکی</p>
            <div className="hero-actions justify-center">
              <Link to="/products" className="btn btn-primary btn-lg">مشاهده محصولات</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Circle Category Icons */}
      <section className="section py-8">
        <div className="container">
          <div className="category-circle-grid">
            {circleCategories.map((cat) => (
              <Link key={cat.id} to={`/products?injury_type=${cat.query}`} className="category-circle-item">
                <div className="circle-icon">{cat.icon}</div>
                <span className="circle-label">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Incredible Offers Section (پیشنهاد شگفت‌انگیز) */}
      <section className="incredible-offers-section">
        <div className="container">
          <div className="incredible-offers-container">
            <div className="incredible-offers-header">
              <div className="offers-title-block">
                <h2>پیشنهاد</h2>
                <h2>شگفت‌انگیز</h2>
              </div>
              <Link to="/products?discount=true" className="view-all-offers">مشاهده همه {'>'}</Link>
            </div>
            
            <div className="incredible-offers-carousel">
              {discountedProducts.map((product) => (
                <div key={product.id} className="offer-card-wrapper">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Service Highlights Bar */}
      <section className="section py-8 border-y border-neutral-200 bg-white">
        <div className="container">
          <div className="trust-grid digikala-trust-grid">
            <div className="trust-item">
              <span className="trust-icon">🚀</span>
              <h3>ارسال اکسپرس و سریع</h3>
            </div>
            <div className="trust-item">
              <span className="trust-icon">🛡️</span>
              <h3>ضمانت ۱۰۰٪ اصالت کالا</h3>
            </div>
            <div className="trust-item">
              <span className="trust-icon">🩺</span>
              <h3>مشاوره تخصصی پزشکی ورزشی</h3>
            </div>
            <div className="trust-item">
              <span className="trust-icon">🔄</span>
              <h3>۷ روز ضمانت تعویض و بازگشت</h3>
            </div>
            <div className="trust-item">
              <span className="trust-icon">💳</span>
              <h3>پرداخت امن بانکی</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <h2>پرفروش‌ترین‌ها</h2>
            <Link to="/products" className="section-link">{t('common.viewAll')}</Link>
          </div>
          {featuredProducts.length > 0 ? (
            <div className="products-grid">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>{t('common.noProducts')}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
