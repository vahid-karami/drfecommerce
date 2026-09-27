import { useEffect, useState } from 'react';
import apiClient from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

// Categories and sports change rarely; fetch each once per page load and share it.
const cache = {};

function load(key, url) {
  if (!cache[key]) {
    cache[key] = apiClient
      .get(url)
      .then((res) => res.data.results || res.data)
      .catch((error) => {
        delete cache[key];
        console.error(`Failed to load ${key}:`, error);
        return [];
      });
  }
  return cache[key];
}

function useCatalogList(key, url) {
  const [items, setItems] = useState([]);
  useEffect(() => {
    let active = true;
    load(key, url).then((data) => active && setItems(data));
    return () => {
      active = false;
    };
  }, [key, url]);
  return items;
}

export const useCategories = () => useCatalogList('categories', ENDPOINTS.categories);
export const useSports = () => useCatalogList('sports', ENDPOINTS.sports);

export const sportName = (sport, lang) => (lang === 'fa' && sport?.name_fa) || sport?.name || '';
