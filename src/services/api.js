const BASE_URL = 'https://parana-kids-main-sbv4op.laravel.cloud/api';

const getHeaders = () => {
  const token = localStorage.getItem('user_token');
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  // Get general store settings (banners, names, etc.)
  getSettings: async () => {
    try {
      const res = await fetch(`${BASE_URL}/store-settings`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await res.json();
    } catch (error) {
      console.error('Error fetching settings:', error);
      throw error;
    }
  },

  // Fetch all products (supports filtering and search)
  getProducts: async ({ search = '', gender_type = '', has_discount = '', page = 1 } = {}) => {
    try {
      let url = `${BASE_URL}/customer/products?page=${page}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (gender_type) url += `&category=${encodeURIComponent(gender_type)}`; // Category parameter in Laravel API
      if (has_discount) url += `&has_discount=${encodeURIComponent(has_discount)}`;

      const res = await fetch(url, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await res.json();
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  // Get single product details
  getProductDetails: async (id) => {
    try {
      const res = await fetch(`${BASE_URL}/customer/products/${id}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await res.json();
    } catch (error) {
      console.error(`Error fetching product ${id} details:`, error);
      throw error;
    }
  },

  // Search autocomplete/suggestions
  getSearchSuggestions: async (query) => {
    if (!query) return [];
    try {
      const res = await fetch(`${BASE_URL}/customer/products/search/suggestions?q=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await res.json();
    } catch (error) {
      console.error('Error fetching search suggestions:', error);
      throw error;
    }
  },

  // Customer Authentication via Google Info
  loginWithGoogle: async (googlePayload) => {
    try {
      const res = await fetch(`${BASE_URL}/customer/google-login`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(googlePayload),
      });
      const data = await res.json();
      if (data.success && data.token) {
        localStorage.setItem('user_token', data.token);
        localStorage.setItem('user_data', JSON.stringify(data.user));
      }
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Place a new order
  createOrder: async (orderData) => {
    try {
      const res = await fetch(`${BASE_URL}/customer/orders`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(orderData),
      });
      return await res.json();
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  // Get customer order history
  getOrders: async () => {
    try {
      const res = await fetch(`${BASE_URL}/customer/orders`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await res.json();
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },

  // Local helper to check if logged in
  isLoggedIn: () => {
    return !!localStorage.getItem('user_token');
  },

  // Local helper to get logged in user info
  getUser: () => {
    const data = localStorage.getItem('user_data');
    return data ? JSON.parse(data) : null;
  },

  // Log out
  logout: () => {
    localStorage.removeItem('user_token');
    localStorage.removeItem('user_data');
  }
};
