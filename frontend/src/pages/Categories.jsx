import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';
import { ENDPOINTS } from '../api/endpoints';


export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiClient.get(ENDPOINTS.categories);
        setCategories(response.data.results || response.data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) {
    return <div className="loading">Loading categories...</div>;
  }

  return (
    <div className="categories-page">
      <h1>Shop by Category</h1>
      <p className="page-description">
        Browse our selection of sports recovery equipment by category
      </p>

      <div className="categories-grid">
        {categories.map((category) => (
          <Link
            key={category.id}
            to={`/products?category=${category.slug}`}
            className="category-card"
          >
            <div className="category-image">
              {category.image ? (
                <img src={category.image} alt={category.name} />
              ) : (
                <div className="placeholder-icon">🏥</div>
              )}
            </div>
            <div className="category-info">
              <h2>{category.name}</h2>
              <p>{category.description}</p>
              <span className="product-count">
                {category.product_count} products
              </span>
            </div>
          </Link>
        ))}
      </div>

      {categories.length === 0 && (
        <p className="no-categories">No categories available.</p>
      )}
    </div>
  );
}
