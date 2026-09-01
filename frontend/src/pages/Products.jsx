import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import apiClient from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import ProductCard from '../components/ProductCard';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [injuryTypes, setInjuryTypes] = useState({});
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const category = searchParams.get('category') || '';
  const injuryType = searchParams.get('injury_type') || '';
  const search = searchParams.get('search') || '';
  const inStock = searchParams.get('in_stock') || '';
  const minPrice = searchParams.get('min_price') || '';
  const maxPrice = searchParams.get('max_price') || '';
  const ordering = searchParams.get('ordering') || '';

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
        if (ordering) params.append('ordering', ordering);
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
  }, [category, injuryType, search, inStock, minPrice, maxPrice, ordering, currentPage]);

  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
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

  const activeFilters = [];
  if (category) {
    const cat = categories.find(c => c.slug === category);
    activeFilters.push({ key: 'category', label: cat?.name || category });
  }
  if (injuryType) {
    activeFilters.push({ key: 'injury_type', label: injuryTypes[injuryType] || injuryType });
  }
  if (minPrice) activeFilters.push({ key: 'min_price', label: `Min $${minPrice}` });
  if (maxPrice) activeFilters.push({ key: 'max_price', label: `Max $${maxPrice}` });
  if (inStock) activeFilters.push({ key: 'in_stock', label: 'In Stock' });

  const sortOptions = [
    { value: '', label: 'Featured' },
    { value: 'created_at', label: 'Newest' },
    { value: 'price', label: 'Price: Low to High' },
    { value: '-price', label: 'Price: High to Low' },
    { value: 'name', label: 'Name: A-Z' },
  ];

  return (
    <div className="products-page">
      <div className="container">
        {/* Page Header */}
        <div className="products-header">
          <div>
            <h1>All Products</h1>
            <p>{totalCount} products</p>
          </div>
        </div>

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className="active-filters">
            {activeFilters.map((filter) => (
              <button
                key={filter.key}
                onClick={() => updateFilter(filter.key, '')}
                className="filter-chip"
              >
                {filter.label} ×
              </button>
            ))}
            <button onClick={clearFilters} className="clear-filters">
              Clear all
            </button>
          </div>
        )}

        {/* Mobile Filter Toggle */}
        <div className="mobile-controls">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-outline btn-sm"
          >
            Filters {activeFilters.length > 0 && `(${activeFilters.length})`}
          </button>
          <select
            value={ordering}
            onChange={(e) => updateFilter('ordering', e.target.value)}
            className="sort-select"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="products-layout">
          {/* Filters Sidebar */}
          <aside className={`filters-sidebar ${showFilters ? 'show' : ''}`}>
            <div className="filters-header">
              <h3>Filters</h3>
              <button onClick={() => setShowFilters(false)} className="close-filters">
                ×
              </button>
            </div>

            <div className="filter-group">
              <label className="filter-label">Search</label>
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => updateFilter('search', e.target.value)}
                className="filter-input"
              />
            </div>

            <div className="filter-group">
              <label className="filter-label">Category</label>
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

            <div className="filter-group">
              <label className="filter-label">Body Part</label>
              <select
                value={injuryType}
                onChange={(e) => updateFilter('injury_type', e.target.value)}
                className="filter-select"
              >
                <option value="">All Body Parts</option>
                {Object.entries(injuryTypes).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Price Range</label>
              <div className="price-inputs">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => updateFilter('min_price', e.target.value)}
                  className="filter-input"
                />
                <span>—</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => updateFilter('max_price', e.target.value)}
                  className="filter-input"
                />
              </div>
            </div>

            <div className="filter-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={inStock === 'true'}
                  onChange={(e) => updateFilter('in_stock', e.target.checked ? 'true' : '')}
                />
                In Stock Only
              </label>
            </div>

            <button onClick={clearFilters} className="btn btn-ghost btn-sm btn-full">
              Clear All Filters
            </button>
          </aside>

          {/* Products Grid */}
          <div className="products-content">
            {loading ? (
              <div className="loading">
                <div className="spinner" />
              </div>
            ) : (
              <>
                <div className="products-grid">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {products.length === 0 && (
                  <div className="empty-state">
                    <span className="empty-state-icon">🔍</span>
                    <h3>No products found</h3>
                    <p>Try adjusting your filters or search terms</p>
                    <button onClick={clearFilters} className="btn btn-primary">
                      Clear Filters
                    </button>
                  </div>
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
      </div>
    </div>
  );
}
