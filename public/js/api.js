/* Centralized API Service Module */

const API = {
  getToken() {
    return localStorage.getItem('fitness_jwt_token');
  },

  setToken(token) {
    if (token) {
      localStorage.setItem('fitness_jwt_token', token);
    } else {
      localStorage.removeItem('fitness_jwt_token');
    }
  },

  getUser() {
    const userStr = localStorage.getItem('fitness_user_data');
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      return null;
    }
  },

  setUser(user) {
    if (user) {
      localStorage.setItem('fitness_user_data', JSON.stringify(user));
    } else {
      localStorage.removeItem('fitness_user_data');
    }
  },

  async request(endpoint, options = {}) {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(endpoint, {
        ...options,
        headers
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `API error (${response.status})`);
      }
      return data;
    } catch (err) {
      console.error(`API Error on [${endpoint}]:`, err.message);
      throw err;
    }
  },

  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  },

  post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  },

  put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
  }
};
