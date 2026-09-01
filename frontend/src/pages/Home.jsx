import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          apiClient.get(ENDPOINTS.featuredProducts),
          apiClient.get(ENDPOINTS.categories),
        ]);
        setFeaturedProducts(productsRes.data.results || productsRes.data);
        setCategories(categoriesRes.data.results || categoriesRes.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const bodyParts = [
    {
      id: 'knee',
      name: 'Knee',
      description: 'Braces, sleeves & supports',
      image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop',
    },
    {
      id: 'ankle',
      name: 'Ankle',
      description: 'Stabilizers & compression',
      image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400&h=300&fit=crop',
    },
    {
      id: 'back',
      name: 'Back',
      description: 'Lumbar supports & braces',
      image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=300&fit=crop',
    },
    {
      id: 'shoulder',
      name: 'Shoulder',
      description: 'Rotator cuff & stabilizers',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
    },
    {
      id: 'wrist',
      name: 'Wrist',
      description: 'Splints & compression',
      image: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&h=300&fit=crop',
    },
    {
      id: 'elbow',
      name: 'Elbow',
      description: 'Tennis elbow & support',
      image: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=400&h=300&fit=crop',
    },
  ];

  const sports = [
    {
      id: 'running',
      name: 'Running',
      image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=300&h=200&fit=crop',
    },
    {
      id: 'football',
      name: 'Football',
      image: 'https://images.unsplash.com/photo-1553778263-73a83e9b197c?w=300&h=200&fit=crop',
    },
    {
      id: 'basketball',
      name: 'Basketball',
      image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=300&h=200&fit=crop',
    },
    {
      id: 'tennis',
      name: 'Tennis',
      image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=300&h=200&fit=crop',
    },
    {
      id: 'cycling',
      name: 'Cycling',
      image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=300&h=200&fit=crop',
    },
    {
      id: 'gym',
      name: 'Gym & Fitness',
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300&h=200&fit=crop',
    },
  ];

  const goals = [
    {
      id: 'recovery',
      name: 'Injury Recovery',
      description: 'Support your healing process',
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=250&fit=crop',
    },
    {
      id: 'prevention',
      name: 'Injury Prevention',
      description: 'Stay protected during activity',
      image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=250&fit=crop',
    },
    {
      id: 'performance',
      name: 'Performance',
      description: 'Optimize your movement',
      image: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=400&h=250&fit=crop',
    },
    {
      id: 'daily',
      name: 'Daily Support',
      description: 'Comfort for everyday activities',
      image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=250&fit=crop',
    },
  ];

  const guides = [
    {
      title: 'How to Choose a Knee Brace',
      description: 'Learn what to look for based on your activity and support needs.',
      image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=200&fit=crop',
    },
    {
      title: 'Understanding Support Levels',
      description: 'From light compression to maximum stabilization.',
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=200&fit=crop',
    },
    {
      title: 'Size Guide',
      description: 'Find your perfect fit with our measurement guide.',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=200&fit=crop',
    },
  ];

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero" style={{
        background: `linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.85) 100%), url('https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1920&h=800&fit=crop') center/cover`,
      }}>
        <div className="container">
          <div className="hero-content">
            <span className="hero-badge">Sports Recovery Specialists</span>
            <h1 className="hero-title">
              Move better.<br />Recover stronger.
            </h1>
            <p className="hero-subtitle">
              Sports recovery and support products designed to help you stay active,
              recover confidently, and perform at your best.
            </p>
            <div className="hero-actions">
              <Link to="/products" className="btn btn-primary btn-lg">
                Shop Recovery
              </Link>
              <Link to="/products?injury_type=knee" className="btn btn-secondary btn-lg">
                Find Your Support
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Shop by Body Part */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>Shop by Body Part</h2>
            <p>Find the right support for your needs</p>
          </div>
          <div className="body-parts-grid">
            {bodyParts.map((part) => (
              <Link
                key={part.id}
                to={`/products?injury_type=${part.id}`}
                className="body-part-card"
              >
                <div className="body-part-image">
                  <img src={part.image} alt={part.name} loading="lazy" />
                </div>
                <h3>{part.name}</h3>
                <p>{part.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Shop by Sport */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <h2>Shop by Sport</h2>
            <p>Products tailored to your activity</p>
          </div>
          <div className="sports-grid">
            {sports.map((sport) => (
              <Link
                key={sport.id}
                to="/products"
                className="sport-card"
              >
                <div className="sport-image">
                  <img src={sport.image} alt={sport.name} loading="lazy" />
                </div>
                <span>{sport.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Shop by Goal */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>Shop by Goal</h2>
            <p>What are you looking to achieve?</p>
          </div>
          <div className="goals-grid">
            {goals.map((goal) => (
              <Link
                key={goal.id}
                to="/products"
                className="goal-card"
              >
                <div className="goal-image">
                  <img src={goal.image} alt={goal.name} loading="lazy" />
                </div>
                <h3>{goal.name}</h3>
                <p>{goal.description}</p>
                <span className="goal-link">Shop now →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <h2>Featured Products</h2>
            <Link to="/products" className="section-link">View all →</Link>
          </div>
          {featuredProducts.length > 0 ? (
            <div className="products-grid">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No featured products yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* Trust Section */}
      <section className="section trust-section">
        <div className="container">
          <div className="trust-grid">
            <div className="trust-item">
              <span className="trust-icon">🚚</span>
              <h3>Free Shipping</h3>
              <p>On orders over $100</p>
            </div>
            <div className="trust-item">
              <span className="trust-icon">🔄</span>
              <h3>Easy Returns</h3>
              <p>30-day return policy</p>
            </div>
            <div className="trust-item">
              <span className="trust-icon">🛡️</span>
              <h3>Quality Guaranteed</h3>
              <p>Medical-grade materials</p>
            </div>
            <div className="trust-item">
              <span className="trust-icon">💬</span>
              <h3>Expert Support</h3>
              <p>Professional guidance</p>
            </div>
          </div>
        </div>
      </section>

      {/* Educational Section */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>Find the Right Support</h2>
            <p>Guides to help you make informed choices</p>
          </div>
          <div className="guides-grid">
            {guides.map((guide, idx) => (
              <article key={idx} className="guide-card">
                <div className="guide-image">
                  <img src={guide.image} alt={guide.title} loading="lazy" />
                </div>
                <div className="guide-content">
                  <h3>{guide.title}</h3>
                  <p>{guide.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
