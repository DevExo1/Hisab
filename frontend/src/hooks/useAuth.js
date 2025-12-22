import { useState, useEffect } from 'react';
import { authAPI, userAPI } from '../api';

/**
 * Custom hook for authentication
 */
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load user data from API when authenticated
  useEffect(() => {
    if (authAPI.isAuthenticated() && !user) {
      loadUserData();
    }
  }, []);

  /**
   * Load current user data from API
   */
  const loadUserData = async () => {
    try {
      setLoading(true);
      const userData = await userAPI.getCurrentUser();
      console.log('User data loaded:', userData);
      setUser(userData);
    } catch (error) {
      console.error('Failed to load user data:', error);
      setError('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle user login
   */
  const login = async (email, password) => {
    try {
      console.log('Login attempt:', email);
      setLoading(true);
      setError(null);

      await authAPI.login(email, password);
      console.log('Login successful, loading user data');
      await loadUserData();
      console.log('User data loaded, login complete');

      return true;
    } catch (error) {
      console.error('Login failed:', error);
      setError('Login failed. Please check your credentials.');
      return false;
    } finally {
      console.log('handleLogin finally block - setting loading to false');
      setLoading(false);
    }
  };

  /**
   * Handle user logout
   */
  const logout = () => {
    authAPI.logout();
    setUser(null);
  };

  return {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: authAPI.isAuthenticated()
  };
};
