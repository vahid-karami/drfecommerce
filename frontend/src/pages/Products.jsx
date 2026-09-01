import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import apiClient from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import ProductCard from '../components/ProductCard';
import './Products.css';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [injuryTypes, setInjuryTypes] = useState({});
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const category = searchParams.get('category') || '';
  const injuryType = searchParams.get('injury_type') || '';
  const search = searchParams.get('search') || '';
  const inStock = searchParams.get('in_stock') || '';
  const minPrice = searchParams.get('min_price') || '';
  const maxPrice = searchParams.get('max_price') || '';

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const [categoriesRes, injuryTypesRes] = await Promise.all([
          apiClient.get(ENDPOINTS.categories),
          apiClient.get(ENDPOINTS.injuryTypes),
        ]);
        setCategories(categoriesRes.data.results || categoriesRes.data);
        setInjuryTypes(injuryTypesRes.data);
      } catch (error) {
        console.error('Failed to fetch filters:', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (category) params.append('category', category);
        if (injuryType) params.append('injury_type', injuryType);
        if (search) params.append('search', search);
        if (inStock) params.append('in_stock', inStock);
        if (minPrice) params.append('min_price', minPrice);
        if (maxPrice) params.append('max_price', maxPrice);
        params.append('page', currentPage);

        const response = await apiClient.get(`${ENDPOINTS.products}?${params}`);
        setProducts(response.data.results);
        setTotalCount(response.data.count);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [category, injuryType, search, inStock, minPrice, maxPrice, currentPage]);

  const updateFilter = (key, value) => {
    const newParams = new SearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.delete('page');
    setSearchParams(newParams);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchParams({});
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalCount / 20);

  return (
    <div className="products-page">
      <aside className="filters-sidebar">
        <div className="filter-section">
          <h3>Search</h3>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="filter-input"
          />
        </div>

        <div className="filter-section">
          <h3>Category</h3>
          <select
            value={category}
            onChange={(e) => updateFilter('category', e.target.value)}
            className="filter-select"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-section">
          <h3>Injury Type</h3>
          <select
            value={injuryType}
            onChange={(e) => updateFilter('injury_type', e.target.value)}
            className="filter-select"
          >
            <option value="">All Types</option>
            {Object.entries(injuryTypes).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-section">
          <h3>Price Range</h3>
          <div className="price-inputs">
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => updateFilter('min_price', e.target.value)}
              className="filter-input"
            />
            <span>-</span>
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => updateFilter('max_price', e.target.value)}
              className="filter-input"
            />
          </div>
        </div>

        <div className="filter-section">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={inStock === 'true'}
              onChange={(e) => updateFilter('in_stock', e.target.checked ? 'true' : '')}
            />
            In Stock Only
          </label>
        </div>

        <button onClick={clearFilters} className="btn btn-outline btn-sm">
          Clear Filters
        </button>
      </aside>

      <div className="products-content">
        <div className="products-header">
          <p>{totalCount} products found</p>
        </div>

        {loading ? (
          <div className="loading">Loading products...</div>
        ) : (
          <>
            <div className="products-grid">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {products.length === 0 && (
              <p className="no-products">No products found matching your criteria.</p>
            )}

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="btn btn-outline btn-sm"
                >
                  Previous
                </button>
                <span className="page-info">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="btn btn-outline btn-sm"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
