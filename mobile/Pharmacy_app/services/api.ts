import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Configuration
const API_BASE_URL = 'http://192.168.1.19:8083/api';

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
        console.log('Authorization header set:', config.headers.Authorization);
      } else {
        console.log('No token found in storage');
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

export interface SaleItem {
  id: number;
  produit: {
    id: number;
    nomMedicament: string;
  };
  quantite: number;
  prixVenteTTC: number;
}

export interface Sale {
  id: number;
  date: string;
  clientName: string;
  total: number;
  items: SaleItem[];
  status: 'completed' | 'pending' | 'cancelled';
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
      console.log('Delete URL:', `/produits/delete/${id}`);
      
      // First check if we have a token
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await api.delete(`/produits/delete/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Delete response status:', response.status);
      console.log('Delete response data:', response.data);
      
      if (response.status === 204 || response.status === 200) {
        console.log('Delete successful');
        return;
      }
      
      console.log('Delete failed with status:', response.status);
      throw new Error('Failed to delete product');
    } catch (error: any) {
      console.error('Error in delete product:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      
      if (error.response?.status === 403) {
        throw new Error('You do not have permission to delete this product');
      }
      
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
  addStock: async (
    productId: number,
    numeroLot: string,
    dateExpiration: string,
    quantite: number,
    prixAchatHT: number
  ): Promise<StockLot> => {
    try {
      const response = await api.post('/stock/add', null, {
        params: {
          productId,
          numeroLot,
          dateExpiration,
          quantite,
          prixAchatHT
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error adding stock:', error);
      throw error;
    }
  },
  updateStock: async (
    lotId: number,
    numeroLot: string,
    dateExpiration: string,
    quantite: number,
    prixAchatHT: number
  ): Promise<StockLot> => {
    try {
      const response = await api.post('/stock/update', null, {
        params: {
          lotId,
          numeroLot,
          dateExpiration,
          quantite,
          prixAchatHT
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating stock:', error);
      throw error;
    }
  },
  removeStock: async (lotId: number, quantity: number): Promise<StockLot> => {
    try {
      const response = await api.post('/stock/remove', null, {
        params: {
          lotId,
          quantity
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error removing stock:', error);
      throw error;
    }
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/stock/delete/${id}`);
  },
};

export const salesAPI = {
  getAll: async (): Promise<Sale[]> => {
    try {
      console.log('Fetching all sales...');
      const response = await api.get('/ventes/all');
      console.log('Sales response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in getAll sales:', error);
      throw error;
    }
  },
  getById: async (id: number): Promise<Sale> => {
    const response = await api.get(`/ventes/${id}`);
    return response.data;
  },
  create: async (data: Omit<Sale, 'id'>): Promise<Sale> => {
    try {
      console.log('Creating new sale with data:', data);
      const response = await api.post('/ventes/add', data);
      console.log('Create sale response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating sale:', error);
      throw error;
    }
  },
  update: async (id: number, data: Partial<Sale>): Promise<Sale> => {
    const response = await api.put(`/ventes/update/${id}`, data);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    try {
      console.log('Sending delete request for sale ID:', id);
      console.log('Delete URL:', `/ventes/${id}`);
      const response = await api.delete(`/ventes/${id}`);
      console.log('Delete response status:', response.status);
      console.log('Delete response data:', response.data);
      if (response.status === 204 || response.status === 200) {
        console.log('Delete successful');
        return;
      }
      console.log('Delete failed with status:', response.status);
      throw new Error('Failed to delete sale');
    } catch (error: any) {
      console.error('Error in delete sale:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  },
};

export default api; 