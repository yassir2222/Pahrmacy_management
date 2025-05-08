import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';

type ThemeContextType = {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  theme: Theme;
};

export interface Theme {
  background: string;
  surface: string;
  primary: string;
  error: string;
  warning: string;
  text: string;
  textSecondary: string;
  success: string;
}

export const lightTheme: Theme = {
  background: '#FFFFFF',
  surface: '#F5F5F5',
  primary: '#2196F3',
  error: '#F44336',
  warning: '#FF9800',
  text: '#000000',
  textSecondary: '#757575',
  success: '#4CAF50',
};

export const darkTheme: Theme = {
  background: '#121212',
  surface: '#1E1E1E',
  primary: '#90CAF9',
  error: '#EF5350',
  warning: '#FFB74D',
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  success: '#81C784',
};

const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  toggleDarkMode: () => {},
  theme: lightTheme,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');

  useEffect(() => {
    setIsDarkMode(systemColorScheme === 'dark');
  }, [systemColorScheme]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext); 