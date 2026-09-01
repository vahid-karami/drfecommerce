import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiClient from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import { useAuth } from './AuthContext';

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState({ items: [], total_items: 0 });
  const [loading, setLoading] = useState(false);

  const fetchFavorites = useCallback(async () => {
    if (!isAuthenticated) {
      setFavorites({ items: [], total_items: 0 });
      return;
    }
    setLoading(true);
    try {
      const response = await apiClient.get(ENDPOINTS.favorites);
      setFavorites(response.data);
    } catch (error) {
      console.error('Failed to fetch favorites:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const addToFavorites = async (productId) => {
    const response = await apiClient.post(ENDPOINTS.favoriteAdd, { product_id: productId });
    setFavorites(response.data);
    return response.data;
  };

  const removeFromFavorites = async (productId) => {
    const response = await apiClient.delete(ENDPOINTS.favoriteRemove, {
      data: { product_id: productId },
    });
    setFavorites(response.data);
    return response.data;
  };

  const clearFavorites = async () => {
    const response = await apiClient.delete(ENDPOINTS.favoriteClear);
    setFavorites(response.data);
    return response.data;
  };

  const isInFavorites = (productId) => {
    return favorites.items?.some((item) => item.product.id === productId) || false;
  };

  const toggleFavorite = async (productId) => {
    if (isInFavorites(productId)) {
      return await removeFromFavorites(productId);
    } else {
      return await addToFavorites(productId);
    }
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        loading,
        addToFavorites,
        removeFromFavorites,
        clearFavorites,
        toggleFavorite,
        isInFavorites,
        refreshFavorites: fetchFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
