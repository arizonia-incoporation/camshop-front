import axios from "axios";
import { storage } from "../context/AuthContext";

// 1. Create an Axios instance
const apiClient = axios.create({
  baseURL: "https://camshop-server.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Skip token attachment for auth endpoints
      const authEndpoints = ["/auth/login", "/auth/register"];
      const shouldSkipAuth = authEndpoints.some((endpoint) =>
        config.url?.includes(endpoint),
      );

      if (shouldSkipAuth) {
        return config;
      }

      const token = await storage.getItem("userToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error fetching token from SecureStore", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default class AppCalls {
  static async post(endpoint, options) {
    try {
      const res = await apiClient.post(endpoint, options);
      return res.data;
    } catch (error) {
      throw new Error(
        error.response?.data.message || error.message || "An error occurred",
      );
    }
  }
  static async get(endpoint, options) {
    try {
      const res = await apiClient.get(endpoint, options);
      return res.data;
    } catch (error) {
      throw new Error(
        error.response?.data || error.message || "An error occurred",
      );
    }
  }
  static async patch(endpoint, options) {
    try {
      const res = await apiClient.patch(endpoint, options);
      return res.data;
    } catch (error) {
      console.log(error)
      throw new Error(
        error.response?.data || error.message || "An error occurred",
      );
    }
  }

  static async remove(endpoint, options) {
    try {
      const res = await apiClient.delete(endpoint, options);
      return res.data;
    } catch (error) {
      throw new Error(
        error.response?.data || error.message || "An error occurred",
      );
    }
  }
}
