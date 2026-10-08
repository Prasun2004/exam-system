import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",

  headers: {
    "Content-Type": "application/json",
  },
});

// =====================================================
// JWT TOKEN INTERCEPTOR
// =====================================================

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);

// =====================================================
// HANDLE UNAUTHORIZED REQUESTS
// =====================================================

api.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {

    if (error.response?.status === 401) {

      // Remove expired/invalid authentication
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Redirect to login
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;