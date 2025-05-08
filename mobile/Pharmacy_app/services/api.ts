import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Configuration
const API_BASE_URL = 'http://192.168.1.98:8083/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      console.log('Token from storage:', token);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      console.log('Request config:', {
        url: config.url,
        method: config.method,
        headers: config.headers,
      });
      return config;
    } catch (error) {
      console.error('Error in request interceptor:', error);
      return config;
    }
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    return Promise.reject(error);
  }
);

// Types
export interface User {
  id?: number;
  username: string;
  password: string;
  email?: string;
  name?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Product {
  id: number;
  nomMedicament: string;
  codeEAN: string;
  prixVenteTTC: number;
  prixAchatHT: number;
  seuilStock: number;
  forme: string;
  dosage: string;
  quantiteTotaleEnStock: number;
}

export interface StockLot {
  id: number;
  numeroLot: string;
  dateExpiration: string;
  produit: {
    id: number;
  };
  quantite: number;
  prixAchatHT: number;
  dateReception: string;
}

// API Methods
export const authAPI = {
  login: async (username: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },
  register: async (userData: User): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
};

export const productAPI = {
  getAll: async (): Promise<Product[]> => {
    try {
      console.log('Fetching all products...');
      const response = await api.get('/produits/all');
      console.log('Products response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in getAll products:', error);
      throw error;
    }
  },
  getById: async (id: number): Promise<Product> => {
    const response = await api.get(`/produits/${id}`);
    return response.data;
  },
  create: async (data: Omit<Product, 'id'>): Promise<Product> => {
    try {
      console.log('Creating new product with data:', data);
      const response = await api.post('/produits/add', data);
      console.log('Create product response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },
  update: async (id: number, data: Partial<Product>): Promise<Product> => {
    const response = await api.put(`/produits/update/${id}`, data);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    try {
      console.log('Sending delete request for product ID:', id);
      const response = await api.delete(`/produits/delete/${id}`);
      console.log('Delete response:', response);
      if (response.status === 204) {
        return;
      }
      throw new Error('Failed to delete product');
    } catch (error: any) {
      console.error('Error in delete product:', error);
      if (error.response?.data?.includes('stock restant disponible')) {
        throw new Error('Cannot delete product with remaining stock');
      }
      throw error;
    }
  },
};

export const stockAPI = {
  getAll: async (): Promise<StockLot[]> => {
    const response = await api.get('/stock/all');
    return response.data;
  },
  getById: async (id: number): Promise<StockLot> => {
    const response = await api.get(`/stock/${id}`);
    return response.data;
  },
  create: async (data: Omit<StockLot, 'id'>): Promise<StockLot> => {
    const response = await api.post('/stock/add', data);
    return response.data;
  },
  update: async (id: number, data: Partial<StockLot>): Promise<StockLot> => {
    const response = await api.put(`/stock/update/${id}`, data);
    return response.data;
  },
  remove: async (lotId: number, quantity: number): Promise<void> => {
    await api.post('/stock/remove', null, {
      params: {
        lotId,
        quantity
      }
    });
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/stock/delete/${id}`);
  },
};

export default api; 