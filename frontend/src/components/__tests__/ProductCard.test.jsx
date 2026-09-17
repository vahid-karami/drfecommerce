import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import ProductCard from '../ProductCard';

import apiClient from '../../api/client';

vi.mock('../../api/client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));
vi.mock('../../api/endpoints', () => ({ ENDPOINTS: { productDetail: () => '/api/products/test/' } }));
vi.mock('../../context/FavoritesContext', () => ({
  useFavorites: () => ({
    toggleFavorite: vi.fn(),
    isInFavorites: () => false,
  }),
}));
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ isAuthenticated: true }),
}));
vi.mock('../../context/CartContext', () => ({
  useCart: () => ({
    addToCart: vi.fn(),
  }),
}));
vi.mock('../../context/ToastContext', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
  }),
}));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, defaultValue) => (typeof defaultValue === 'string' ? defaultValue : key),
    i18n: { language: 'en', changeLanguage: vi.fn() },
  }),
}));
vi.mock('react-router-dom', () => ({
  Link: ({ children, to }) => <a href={to}>{children}</a>,
  useNavigate: () => vi.fn(),
}));

const mockProduct = {
  id: 1,
  name: 'Test Product',
  slug: 'test-product',
  price: '99.99',
  discount_price: '79.99',
  effective_price: '79.99',
  brand: 'TestBrand',
  injury_type: 'knee',
  in_stock: true,
  is_featured: true,
  primary_image: { id: 1, image: 'https://example.com/image.jpg', alt_text: 'Test' },
};

describe('ProductCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiClient.get.mockResolvedValue({
      data: { id: 1, name: 'Test Product', images: [], effective_price: '79.99' },
    });
  });

  it('renders product name and price', () => {
    render(<ProductCard product={mockProduct} />);

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('79.99 Toman')).toBeInTheDocument();
    expect(screen.getByText('TestBrand')).toBeInTheDocument();
  });

  it('renders discounted price with original price', () => {
    render(<ProductCard product={mockProduct} />);

    expect(screen.getByText('99.99 Toman')).toBeInTheDocument();
    expect(screen.getByText('79.99 Toman')).toBeInTheDocument();
  });

  it('renders "Sale" badge when product has discount', () => {
    render(<ProductCard product={mockProduct} />);

    expect(screen.getByText('٪ 20')).toBeInTheDocument();
  });

  it('shows out of stock when not in stock', () => {
    const outOfStockProduct = { ...mockProduct, in_stock: false };
    render(<ProductCard product={outOfStockProduct} />);

    expect(screen.getByText('ناموجود')).toBeInTheDocument();
  });

  it('opens quick view when quick view button is clicked', async () => {
    render(<ProductCard product={mockProduct} />);
    const quickViewBtn = screen.getByLabelText('Quick view');
    await act(async () => {
      fireEvent.click(quickViewBtn);
    });
  });
});
