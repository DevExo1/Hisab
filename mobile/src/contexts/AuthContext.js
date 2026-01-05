import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/client';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [currency, setCurrency] = useState('USD');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserFromStorage();
  }, []);

  const loadUserFromStorage = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      const storedCurrency = await AsyncStorage.getItem('currency');
      
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      if (storedCurrency) {
        setCurrency(storedCurrency);
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      // Step 1: Get access token
      const tokenResponse = await api.login(email, password);
      
      if (!tokenResponse.access_token) {
        return { success: false, error: 'Invalid response from server' };
      }
      
      // Step 2: Fetch current user with the token
      const userResponse = await api.getCurrentUser();
      
      if (userResponse) {
        setUser(userResponse);
        await AsyncStorage.setItem('user', JSON.stringify(userResponse));
        
        if (userResponse.currency) {
          setCurrency(userResponse.currency);
          await AsyncStorage.setItem('currency', userResponse.currency);
        }
        
        return { success: true };
      }
      
      return { success: false, error: 'Failed to fetch user data' };
    } catch (error) {
      console.error('Login error:', error);
      if (error.message === 'Invalid credentials') {
        return { success: false, error: 'Invalid email or password' };
      }
      if (error.isNetworkError) {
        return { success: false, error: 'No internet connection' };
      }
      return { 
        success: false, 
        error: error.message || 'Login failed. Please try again.' 
      };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('token');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUser = async (updates) => {
    try {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      
      if (updates.currency) {
        setCurrency(updates.currency);
        await AsyncStorage.setItem('currency', updates.currency);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Update user error:', error);
      return { success: false, error: error.message };
    }
  };

  // Derive isAuthenticated from user state
  const isAuthenticated = !!user;

  const value = {
    user,
    currency,
    isLoading,
    isAuthenticated,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
