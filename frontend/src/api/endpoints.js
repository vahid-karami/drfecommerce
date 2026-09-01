export const API_BASE_URL = 'http://localhost:8000/api';

export const ENDPOINTS = {
  sendOTP: `${API_BASE_URL}/auth/otp/send/`,
  verifyOTP: `${API_BASE_URL}/auth/otp/verify/`,
  register: `${API_BASE_URL}/auth/register/`,
  resetPassword: `${API_BASE_URL}/auth/password/reset/`,
  profile: `${API_BASE_URL}/auth/profile/`,
  tokenRefresh: `${API_BASE_URL}/token/refresh/`,

  categories: `${API_BASE_URL}/products/categories/`,
  products: `${API_BASE_URL}/products/`,
  productDetail: (slug) => `${API_BASE_URL}/products/${slug}/`,
  featuredProducts: `${API_BASE_URL}/products/featured/`,
  injuryTypes: `${API_BASE_URL}/products/injury_types/`,

  cart: `${API_BASE_URL}/cart/`,
  cartAdd: `${API_BASE_URL}/cart/add/`,
  cartUpdate: `${API_BASE_URL}/cart/update/`,
  cartRemove: `${API_BASE_URL}/cart/remove/`,
  cartClear: `${API_BASE_URL}/cart/clear/`,

  orders: `${API_BASE_URL}/orders/`,
  orderCreate: `${API_BASE_URL}/orders/create/`,
  orderDetail: (id) => `${API_BASE_URL}/orders/${id}/`,
  orderCancel: (id) => `${API_BASE_URL}/orders/${id}/cancel/`,

  productReviews: (slug) => `${API_BASE_URL}/reviews/product/${slug}/`,
  reviewCreate: (slug) => `${API_BASE_URL}/reviews/product/${slug}/create/`,
  reviewUpdate: (id) => `${API_BASE_URL}/reviews/${id}/update/`,
  reviewDelete: (id) => `${API_BASE_URL}/reviews/${id}/delete/`,

  favorites: `${API_BASE_URL}/favorites/`,
  favoriteAdd: `${API_BASE_URL}/favorites/add/`,
  favoriteRemove: `${API_BASE_URL}/favorites/remove/`,
  favoriteClear: `${API_BASE_URL}/favorites/clear/`,
};
