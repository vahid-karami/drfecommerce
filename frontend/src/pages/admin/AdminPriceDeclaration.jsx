import { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { ENDPOINTS } from '../../api/endpoints';
import { useToast } from '../../context/ToastContext';
import Price from '../../components/Price';

export default function AdminPriceDeclaration() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [percentage, setPercentage] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await apiClient.get(ENDPOINTS.categories);
      setCategories(res.data);
    } catch (err) {
      showToast('Failed to load categories', 'error');
    }
  };

  const handleCategorySelect = async (e) => {
    const catId = e.target.value;
    setSelectedCategory(catId);
    
    if (!catId) {
      setProducts([]);
      return;
    }

    setLoading(true);
    try {
      // Find category slug to fetch its products
      const cat = categories.find(c => c.id.toString() === catId);
      if (cat) {
        const res = await apiClient.get(ENDPOINTS.adminProducts, {
          params: { category: cat.slug }
        });
        setProducts(res.data.results || res.data);
      }
    } catch (err) {
      showToast('Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const calculateNewPrice = (currentPrice) => {
    if (!currentPrice || !percentage) return currentPrice;
    const val = parseFloat(percentage);
    if (isNaN(val)) return currentPrice;
    
    const newPrice = parseFloat(currentPrice) * (1 + (val / 100));
    return Math.round(newPrice / 1000) * 1000;
  };

  const handleSubmit = async () => {
    if (!percentage) {
      showToast('Please enter a percentage', 'warning');
      return;
    }

    if (!window.confirm('Are you sure you want to apply this price update?')) return;

    setLoading(true);
    try {
      const res = await apiClient.post(ENDPOINTS.adminBulkPriceUpdate, {
        category_id: selectedCategory || null,
        percentage: parseFloat(percentage)
      });
      showToast(res.data.message, 'success');
      // Refresh products
      handleCategorySelect({ target: { value: selectedCategory } });
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to update prices', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="admin-price-declaration print-container">
      <div className="admin-header hide-on-print">
        <h1>اعلامیه قیمت (Price Declaration)</h1>
        <div className="header-actions">
          <button onClick={handlePrint} className="btn btn-outline mr-2">
            🖨 چاپ اعلامیه (Print)
          </button>
          <button onClick={handleSubmit} disabled={loading || !percentage} className="btn btn-primary">
            {loading ? 'Updating...' : 'اعمال تغییرات (Apply)'}
          </button>
        </div>
      </div>

      <div className="controls-panel card hide-on-print mb-6 p-4">
        <div className="form-row">
          <div className="form-group mb-0">
            <label className="form-label">دسته بندی (Category)</label>
            <select
              value={selectedCategory}
              onChange={handleCategorySelect}
              className="form-select"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name_fa || cat.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group mb-0">
            <label className="form-label">درصد تغییر (Percentage %)</label>
            <input
              type="number"
              step="0.1"
              placeholder="e.g. 15 for +15%, -10 for -10%"
              value={percentage}
              onChange={(e) => setPercentage(e.target.value)}
              className="form-input"
              dir="ltr"
            />
          </div>
        </div>
        <p className="text-sm text-neutral-500 mt-2">
          Enter a positive number to increase prices, or a negative number to decrease.
          Prices will be automatically rounded to the nearest 1,000 Toman.
        </p>
      </div>

      <div className="print-header show-on-print-only">
        <h2>لیست قیمت محصولات (Price List)</h2>
        <p>Date: {new Date().toLocaleDateString('fa-IR')}</p>
        {selectedCategory && (
          <p>Category: {categories.find(c => c.id.toString() === selectedCategory)?.name_fa}</p>
        )}
      </div>

      {loading && products.length === 0 ? (
        <p>Loading...</p>
      ) : (
        <div className="table-responsive">
          <table className="admin-table price-table">
            <thead>
              <tr>
                <th>نام کالا (Product)</th>
                <th>دسته (Category)</th>
                <th>قیمت فعلی (Current)</th>
                <th className="new-price-col">قیمت جدید (New)</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => {
                const newPrice = calculateNewPrice(product.price);
                const isChanged = newPrice !== parseFloat(product.price);
                return (
                  <tr key={product.id}>
                    <td>{product.name_fa || product.name}</td>
                    <td>{product.category_name}</td>
                    <td><Price amount={product.price} /></td>
                    <td className={`new-price-col ${isChanged ? 'text-success font-bold' : ''}`}>
                      <Price amount={newPrice} />
                    </td>
                  </tr>
                );
              })}
              {products.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center py-4">No products found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
