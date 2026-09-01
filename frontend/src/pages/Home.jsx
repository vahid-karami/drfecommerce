import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import ProductCard from '../components/ProductCard';
import './Home.css';

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

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1>Sport Injury Recovery Equipment</h1>
          <p>Professional-grade braces, supports, and recovery gear for athletes</p>
          <Link to="/products" className="btn btn-primary btn-lg">
            Shop Now
          </Link>
        </div>
      </section>

      <section className="categories-section">
        <h2>Shop by Injury Type</h2>
        <div className="categories-grid">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/products?category=${category.slug}`}
              className="category-card"
            >
              <h3>{category.name}</h3>
              <p>{category.product_count} products</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="featured-section">
        <h2>Featured Products</h2>
        <div className="products-grid">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        {featuredProducts.length === 0 && (
          <p className="no-products">No featured products yet.</p>
        )}
      </section>

      <section className="features-section">
        <div className="feature">
          <span className="feature-icon">🚚</span>
          <h3>Free Shipping</h3>
          <p>On orders over $100</p>
        </div>
        <div className="feature">
          <span className="feature-icon">🔄</span>
          <h3>Easy Returns</h3>
          <p>30-day return policy</p>
        </div>
        <div className="feature">
          <span className="feature-icon">🛡️</span>
          <h3>Quality Guaranteed</h3>
          <p>Medical-grade materials</p>
        </div>
        <div className="feature">
          <span className="feature-icon">💬</span>
          <h3>Expert Support</h3>
          <p>Professional guidance</p>
        </div>
      </section>
    </div>
  );
}
