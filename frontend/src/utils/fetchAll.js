import apiClient from '../api/client';

// Follow DRF's `next` links to load every page of a paginated list.
export async function fetchAllPages(url, params = {}) {
  const results = [];
  let next = url;
  let query = params;
  while (next) {
    const { data } = await apiClient.get(next, { params: query });
    if (!Array.isArray(data.results)) return data; // not paginated
    results.push(...data.results);
    // `next` is absolute (Django's host); keep requests on our own origin/proxy.
    next = data.next ? new URL(data.next).pathname + new URL(data.next).search : null;
    query = undefined;
  }
  return results;
}
