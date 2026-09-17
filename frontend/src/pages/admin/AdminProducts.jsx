import { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { ENDPOINTS } from '../../api/endpoints';
import { useToast } from '../../context/ToastContext';
import Price from '../../components/Price';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    name_fa: '',
    description: '',
    description_fa: '',
    category: '',
    price: '',
    price_irr: '',
    cost: '',
    cost_irr: '',
    discount_price: '',
    discount_price_irr: '',
    stock: '',
    injury_type: 'general',
    brand: '',
    size: '',
    color: '',
    weight: '',
    material: '',
    is_active: true,
    is_featured: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        apiClient.get(ENDPOINTS.adminProducts),
        apiClient.get(ENDPOINTS.categories),
      ]);
      setProducts(productsRes.data);
      setCategories(categoriesRes.data);
    } catch {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const data = {
        ...formData,
        price: formData.price ? parseFloat(formData.price) : 0,
        price_irr: formData.price_irr ? parseInt(formData.price_irr) : null,
        cost: formData.cost ? parseFloat(formData.cost) : null,
        cost_irr: formData.cost_irr ? parseInt(formData.cost_irr) : null,
        discount_price: formData.discount_price ? parseFloat(formData.discount_price) : null,
        discount_price_irr: formData.discount_price_irr ? parseInt(formData.discount_price_irr) : null,
        stock: parseInt(formData.stock) || 0,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        category: formData.category ? parseInt(formData.category) : null,
      };

      if (editingProduct) {
        await apiClient.put(ENDPOINTS.adminProductDetail(editingProduct.slug), data);
        showToast('Product updated successfully', 'success');
      } else {
        await apiClient.post(ENDPOINTS.adminProducts, data);
        showToast('Product created successfully', 'success');
      }

      setShowModal(false);
      setEditingProduct(null);
      resetForm();
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      name_fa: product.name_fa || '',
      description: product.description || '',
      description_fa: product.description_fa || '',
      category: product.category?.id || '',
      price: product.price?.toString() || '',
      price_irr: product.price_irr?.toString() || '',
      cost: product.cost?.toString() || '',
      cost_irr: product.cost_irr?.toString() || '',
      discount_price: product.discount_price?.toString() || '',
      discount_price_irr: product.discount_price_irr?.toString() || '',
      stock: product.stock?.toString() || '0',
      injury_type: product.injury_type || 'general',
      brand: product.brand || '',
      size: product.size || '',
      color: product.color || '',
      weight: product.weight?.toString() || '',
      material: product.material || '',
      is_active: product.is_active ?? true,
      is_featured: product.is_featured ?? false,
    });
    setShowModal(true);
  };

  const handleDelete = async (slug) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await apiClient.delete(ENDPOINTS.adminProductDetail(slug));
        showToast('Product deleted successfully', 'success');
        fetchData();
      } catch {
        showToast('Failed to delete product', 'error');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      name_fa: '',
      description: '',
      description_fa: '',
      category: '',
      price: '',
      price_irr: '',
      cost: '',
      cost_irr: '',
      discount_price: '',
      discount_price_irr: '',
      stock: '',
      injury_type: 'general',
      brand: '',
      size: '',
      color: '',
      weight: '',
      material: '',
      is_active: true,
      is_featured: false,
    });
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="admin-products-page">
      <div className="container">
        <div className="admin-header">
          <div>
            <h1>Product Management</h1>
            <p>Add, edit, and manage your product catalog and pricing</p>
          </div>
          <button onClick={() => { setEditingProduct(null); resetForm(); setShowModal(true); }} className="btn btn-primary">
            + Add Product
          </button>
        </div>

        <div className="admin-stats">
          <div className="stat-card">
            <span className="stat-value">{products.length}</span>
            <span className="stat-label">Total Products</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{products.filter(p => p.in_stock).length}</span>
            <span className="stat-label">In Stock</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{products.filter(p => p.is_featured).length}</span>
            <span className="stat-label">Featured</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{products.filter(p => !p.is_active).length}</span>
            <span className="stat-label">Inactive</span>
          </div>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Cost</th>
                <th>Margin</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className="product-cell">
                      <span className="product-name">{product.name}</span>
                      <span className="product-brand">{product.brand || 'No brand'}</span>
                    </div>
                  </td>
                  <td>{product.category_name || '-'}</td>
                  <td><Price amount={product.effective_price} /></td>
                  <td>{product.cost ? <Price amount={product.cost} /> : '-'}</td>
                  <td>
                    {product.margin !== null ? (
                      <span className={product.margin >= 0 ? 'text-success' : 'text-error'}>
                        <Price amount={product.margin} /> ({product.margin_percent}%)
                      </span>
                    ) : '-'}
                  </td>
                  <td>
                    <span className={product.in_stock ? 'text-success' : 'text-error'}>
                      {product.stock}
                    </span>
                  </td>
                  <td>
                    <div className="status-badges">
                      {product.is_active && <span className="badge badge-success">Active</span>}
                      {product.is_featured && <span className="badge badge-primary">Featured</span>}
                      {!product.is_active && <span className="badge badge-error">Inactive</span>}
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button onClick={() => handleEdit(product)} className="btn btn-sm btn-outline">Edit</button>
                      <button onClick={() => handleDelete(product.slug)} className="btn btn-sm btn-ghost text-error">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={() => setShowModal(false)} className="modal-close">&times;</button>
            </div>
            <div className="modal-body">
              {error && <div className="error-message">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Name (English) *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Name (Persian)</label>
                    <input
                      type="text"
                      value={formData.name_fa}
                      onChange={(e) => setFormData({ ...formData, name_fa: e.target.value })}
                      className="form-input"
                      dir="rtl"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="form-input"
                      required
                    >
                      <option value="">Select category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Injury Type</label>
                    <select
                      value={formData.injury_type}
                      onChange={(e) => setFormData({ ...formData, injury_type: e.target.value })}
                      className="form-input"
                    >
                      <option value="general">General</option>
                      <option value="knee">Knee</option>
                      <option value="ankle">Ankle</option>
                      <option value="back">Back</option>
                      <option value="shoulder">Shoulder</option>
                      <option value="wrist">Wrist</option>
                      <option value="elbow">Elbow</option>
                      <option value="hip">Hip</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="form-textarea"
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description (Persian)</label>
                  <textarea
                    value={formData.description_fa}
                    onChange={(e) => setFormData({ ...formData, description_fa: e.target.value })}
                    className="form-textarea"
                    rows={3}
                    dir="rtl"
                  />
                </div>

                <h3 className="form-section-title">Pricing & Cost (Toman)</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Price (Toman) *</label>
                    <input
                      type="number"
                      step="1"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="form-input"
                      placeholder="مثال: 250000"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Cost Price (Toman)</label>
                    <input
                      type="number"
                      step="1"
                      value={formData.cost}
                      onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                      className="form-input"
                      placeholder="مثال: 180000"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Discount Price (Toman)</label>
                    <input
                      type="number"
                      step="1"
                      value={formData.discount_price}
                      onChange={(e) => setFormData({ ...formData, discount_price: e.target.value })}
                      className="form-input"
                      placeholder="مثال: 220000"
                    />
                  </div>
                </div>

                <h3 className="form-section-title">Inventory & Details</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Stock *</label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Brand</label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Size</label>
                    <input
                      type="text"
                      value={formData.size}
                      onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Color</label>
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Weight (grams)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Material</label>
                    <input
                      type="text"
                      value={formData.material}
                      onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    />
                    Active
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    />
                    Featured
                  </label>
                </div>

                <div className="modal-footer">
                  <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                  <button type="submit" disabled={submitting} className="btn btn-primary">
                    {submitting ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
