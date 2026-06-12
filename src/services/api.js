const BASE_URL = 'http://localhost:3001';

/**
 * Helper to standardise API requests.
 * @param {string} endpoint - e.g., '/api/classes'
 * @param {object} options - fetch options
 */
export async function apiFetch(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const res = await fetch(url, config);
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.message || `API Error: ${res.status}`);
    }
    
    return data.data !== undefined ? data.data : data;
  } catch (error) {
    console.error(`API Fetch Error (${endpoint}):`, error);
    throw error;
  }
}
