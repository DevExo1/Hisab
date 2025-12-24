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
      setUser(userData);
    } catch (error) {
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

      setLoading(true);
      setError(null);

      await authAPI.login(email, password);

      await loadUserData();

      return true;
    } catch (error) {

      setError('Login failed. Please check your credentials.');
      return false;
    } finally {

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
