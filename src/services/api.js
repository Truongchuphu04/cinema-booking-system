// API Configuration - Backend API URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// API Client class
class ApiClient {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    console.log('API Request to:', url); // Debug log
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    };

    // Add auth token if available - smart token selection
    const isAdminPage = window.location.pathname.startsWith('/admin');

    let token;
    let tokenSource = '';

    if (isAdminPage) {
      // For admin pages, prefer admin token but allow user token fallback
      token = localStorage.getItem('cinema_admin_token');
      tokenSource = 'admin_token';

      // If no admin token, check if user has admin role
      if (!token) {
        const userToken = localStorage.getItem('cinema_user_token');
        if (userToken) {
          try {
            // Check if current user token belongs to admin
            const storedUser = localStorage.getItem('cinema_user');
            if (storedUser) {
              const user = JSON.parse(storedUser);
              if (user.role === 'admin') {
                token = userToken;
                tokenSource = 'user_token_admin_role';
              }
            }
          } catch (error) {
            console.warn('Error checking user role:', error);
          }
        }
      }
    } else {
      // For user pages, prefer user token
      token = localStorage.getItem('cinema_user_token');
      tokenSource = 'user_token';
    }

    // Final fallback - use any available token
    if (!token) {
      token = localStorage.getItem('cinema_admin_token') ||
        localStorage.getItem('cinema_user_token') ||
        localStorage.getItem('admin_token') ||
        localStorage.getItem('user_token');
      tokenSource = 'fallback';
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`🔑 Authorization header set using ${tokenSource} for ${isAdminPage ? 'admin' : 'user'} page`);
    } else {
      console.log('🔑 No token available for request');
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        // Try to get error details from response
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          }
          if (errorData.errors) {
            errorMessage += ' - ' + errorData.errors.join(', ');
          }
          console.log('❌ Backend error details:', errorData);
        } catch (e) {
          console.log('❌ Could not parse error response');
        }
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // GET request
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  // POST request
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // Upload file
  async upload(endpoint, formData) {
    return this.request(endpoint, {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set content-type for FormData
    });
  }
}

export const apiClient = new ApiClient();