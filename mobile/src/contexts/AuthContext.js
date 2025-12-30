/**
 * Authentication Context
 * Manages user authentication state across the app
 */

import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../api/client';
import biometricAuth from '../utils/biometricAuth';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricLabel, setBiometricLabel] = useState('Biometric');

  // Check if user is logged in on app start
  useEffect(() => {
    checkAuthStatus();
    initializeBiometric();
  }, []);

  const initializeBiometric = async () => {
    try {
      const available = await biometricAuth.isBiometricAvailable();
      setBiometricAvailable(available);
      
      if (available) {
        const label = await biometricAuth.getBiometricLabel();
        setBiometricLabel(label);
      }
    } catch (error) {
      console.error('Error initializing biometric:', error);
    }
  };

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        // Try to get user data, but don't logout if it fails
        try {
          const userData = await apiClient.getCurrentUser();
          setUser(userData);
          setIsAuthenticated(true);
        } catch (error) {
          // Token might be expired, but keep user logged in
          // They'll be prompted to re-authenticate when making API calls
          // Set authenticated with minimal user data
          setIsAuthenticated(true);
          setUser({ id: 'pending', name: 'User' }); // Placeholder
        }
      } else {
        // No token found - user needs to login
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      // Still keep user logged in if token exists
      const token = await AsyncStorage.getItem('token');
      if (token) {
        setIsAuthenticated(true);
        setUser({ id: 'pending', name: 'User' });
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      await apiClient.login(email, password);
      // Wait a bit to ensure token is saved
      await new Promise(resolve => setTimeout(resolve, 100));
      const userData = await apiClient.getCurrentUser();
      setUser(userData);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (userData) => {
    try {
      await apiClient.register(userData);
      // Auto-login after registration
      return await login(userData.email, userData.password);
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const biometricLogin = async () => {
    try {
      // Authenticate with biometric
      const authResult = await biometricAuth.authenticate();
      if (!authResult.success) {
        return { success: false, error: authResult.error, cancelled: authResult.cancelled };
      }

      // Get stored email
      const email = await biometricAuth.getBiometricEmail();
      if (!email) {
        return { success: false, error: 'No stored credentials found. Please login with email and password.' };
      }

      // We need the password to authenticate, but we don't store it for security reasons
      // Instead, we'll try to use the existing token if available
      const token = await AsyncStorage.getItem('token');
      if (token) {
        try {
          const userData = await apiClient.getCurrentUser();
          setUser(userData);
          setIsAuthenticated(true);
          return { success: true };
        } catch (error) {
          // Token might be expired, user needs to login with password again
          return { 
            success: false, 
            error: 'Session expired. Please login with email and password.',
            needsPasswordLogin: true 
          };
        }
      }

      return { 
        success: false, 
        error: 'No active session. Please login with email and password.',
        needsPasswordLogin: true 
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const enableBiometricLogin = async (email) => {
    try {
      const result = await biometricAuth.saveBiometricEmail(email);
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const disableBiometricLogin = async () => {
    try {
      const result = await biometricAuth.disableBiometric();
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
      await biometricAuth.clearBiometricData();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
    }
  };

  const updateUser = (updates) => {
    setUser(prev => ({ ...prev, ...updates }));
  };

  const value = {
    user,
    isLoading,
    isAuthenticated,
    biometricAvailable,
    biometricLabel,
    login,
    register,
    logout,
    updateUser,
    biometricLogin,
    enableBiometricLogin,
    disableBiometricLogin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
