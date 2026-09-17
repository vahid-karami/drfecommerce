import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

vi.mock('../api/client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(() => Promise.resolve({ data: {} })),
    patch: vi.fn(() => Promise.resolve({ data: {} })),
    delete: vi.fn(() => Promise.resolve({ data: {} })),
  },
}));

vi.mock('../api/endpoints', () => ({
  ENDPOINTS: {
    productDetail: (slug) => `/api/products/${slug}/`,
  },
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

describe('useCart', () => {
  it('throws error when used outside CartProvider', () => {
    expect(() => {
      const TestComponent = () => {
        useCart();
        return null;
      };
      render(<TestComponent />);
    }).toThrow('useCart must be used within a CartProvider');
  });
});

describe('useAuth', () => {
  it('throws error when used outside AuthProvider', () => {
    expect(() => {
      const TestComponent = () => {
        useAuth();
        return null;
      };
      render(<TestComponent />);
    }).toThrow('useAuth must be used within an AuthProvider');
  });
});
