import { vi } from 'vitest';

export const mockApi = {
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
  put: vi.fn(),
};

const mockLocalStorage = {
  store: {},
  getItem(key) {
    return this.store[key] || null;
  },
  setItem(key, value) {
    this.store[key] = value.toString();
  },
  removeItem(key) {
    delete this.store[key];
  },
  clear() {
    this.store = {};
  },
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

vi.mock('../api/client', () => ({
  default: mockApi,
}));

vi.mock('../api/endpoints', () => ({
  ENDPOINTS: {
    productDetail: (slug) => `/api/products/${slug}/`,
    productReviews: (slug) => `/api/products/${slug}/reviews/`,
    reviewCreate: (slug) => `/api/products/${slug}/reviews/`,
    cart: '/api/cart/',
    cartAdd: '/api/cart/add/',
    cartUpdate: '/api/cart/update/',
    cartRemove: '/api/cart/remove/',
    cartClear: '/api/cart/clear/',
    orders: '/api/orders/',
    orderCreate: '/api/orders/create/',
    orderCancel: (id) => `/api/orders/${id}/cancel/`,
    categories: '/api/products/categories/',
    featuredProducts: '/api/products/featured/',
    injuryTypes: '/api/products/injury_types/',
    sendOTP: '/api/auth/send-otp/',
    verifyOTP: '/api/auth/verify-otp/',
    register: '/api/auth/register/',
    tokenRefresh: '/api/auth/token/refresh/',
    profile: '/api/auth/profile/',
    resetPassword: '/api/auth/reset-password/',
    login: '/api/auth/login/',
  },
}));
