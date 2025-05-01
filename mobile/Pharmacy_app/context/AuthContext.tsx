// contexts/AuthContext.tsx (Simplified Example)
import React, { createContext, useState, useContext, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_TOKEN_KEY = 'my-jwt-token'; // Define key here

interface AuthContextType {
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean; // Add this property
  login: (newToken: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start loading until token is checked

  useEffect(() => {
    // Load token from storage on app start
    const loadToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
        setToken(storedToken);
      } catch (e) {
        console.error("Failed to load token", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadToken();
  }, []);

  const login = async (newToken: string) => {
    try {
        await AsyncStorage.setItem(AUTH_TOKEN_KEY, newToken);
        setToken(newToken);
    } catch (e) {
      console.error("Failed to save token", e);
      // Handle error appropriately
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      setToken(null);
    } catch (e) {
      console.error("Failed to delete token", e);
       // Handle error appropriately
    }
  };

  // Determine authentication status based on token presence
  const isAuthenticated = token !== null;

  return (
    <AuthContext.Provider value={{ 
      token, 
      isLoading, 
      isAuthenticated, // Include the new property
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};