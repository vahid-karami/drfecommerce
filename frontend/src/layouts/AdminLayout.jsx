import { Link, Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function AdminLayout() {
  const { t } = useTranslation();
  const location = useLocation();

  const navItems = [
    { path: '/admin-portal', label: 'Dashboard', icon: '📊' },
    { path: '/admin-portal/products', label: 'Products', icon: '📦' },
    { path: '/admin-portal/categories', label: 'Categories', icon: '📂' },
    { path: '/admin-portal/orders', label: 'Orders', icon: '🛒' },
    { path: '/admin-portal/price-declaration', label: 'اعلامیه قیمت (Price List)', icon: '📝' },
  ];

  return (
    <div className="admin-portal-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h2>Admin Portal</h2>
        </div>
        <nav className="admin-sidebar-nav">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`admin-nav-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="admin-main-content">
        <Outlet />
      </main>
    </div>
  );
}
