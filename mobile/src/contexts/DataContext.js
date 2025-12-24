/**
 * Data Context
 * Manages app data (friends, groups, expenses, etc.)
 */

import React, { createContext, useState, useContext, useEffect } from 'react';
import { Alert } from 'react-native';
import apiClient from '../api/client';
import { useAuth } from './AuthContext';

const DataContext = createContext({});

export const DataProvider = ({ children }) => {
  const { isAuthenticated, logout } = useAuth();
  
  const [friends, setFriends] = useState([]);
  const [groups, setGroups] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [activity, setActivity] = useState([]);
  const [activityMetadata, setActivityMetadata] = useState({ total: 0, hasMore: false });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load data when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadAllData();
    } else {
      // Clear data on logout
      setFriends([]);
      setGroups([]);
      setExpenses([]);
      setActivity([]);
    }
  }, [isAuthenticated]);

  const loadAllData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [friendsData, groupsData, expensesData, activityResponse] = await Promise.all([
        apiClient.getFriends(),
        apiClient.getGroups(),
        apiClient.getExpenses(),
        apiClient.getActivity(20, 0),
      ]);
      setFriends(friendsData);
      setGroups(groupsData);
      setExpenses(expensesData);
      setActivity(activityResponse.items || activityResponse);
      setActivityMetadata({
        total: activityResponse.total || 0,
        hasMore: activityResponse.has_more || false
      });
    } catch (err) {
      // Handle authentication errors
      if (err.isAuthError) {
        Alert.alert('Session Expired', err.message, [
          { text: 'OK', onPress: () => logout() }
        ]);
        return;
      }
      
      // Handle network errors
      if (err.isNetworkError) {
        Alert.alert('Connection Error', err.message);
      }
      
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = () => {
    return loadAllData();
  };

  // Friends operations
  const addFriend = async (friendData) => {
    try {
      const newFriend = await apiClient.addFriend(friendData);
      setFriends(prev => [...prev, newFriend]);
      return { success: true, data: newFriend };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Groups operations
  const createGroup = async (groupData) => {
    try {
      const newGroup = await apiClient.createGroup(groupData);
      setGroups(prev => [...prev, newGroup]);
      return { success: true, data: newGroup };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const updateGroup = async (groupId, updates) => {
    try {
      const updatedGroup = await apiClient.updateGroup(groupId, updates);
      setGroups(prev => prev.map(g => g.id === groupId ? updatedGroup : g));
      return { success: true, data: updatedGroup };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Expenses operations
  const createExpense = async (expenseData) => {
    try {
      const newExpense = await apiClient.createExpense(expenseData);
      setExpenses(prev => [newExpense, ...prev]);
      await refreshData(); // Refresh to update balances
      return { success: true, data: newExpense };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Settlements operations
  const createSettlement = async (settlementData) => {
    try {
      const newSettlement = await apiClient.createSettlement(settlementData);
      await refreshData(); // Refresh to update balances
      return { success: true, data: newSettlement };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const loadMoreActivity = async () => {
    if (!activityMetadata.hasMore) {
      return { success: false, hasMore: false };
    }
    
    try {
      const currentOffset = activity.length;
      const response = await apiClient.getActivity(20, currentOffset);
      const newItems = response.items || [];
      setActivity(prev => [...prev, ...newItems]);
      setActivityMetadata({
        total: response.total || 0,
        hasMore: response.has_more || false
      });
      
      return { success: true, hasMore: response.has_more || false };
    } catch (error) {
      return { success: false, hasMore: false };
    }
  };

  const value = {
    friends,
    groups,
    expenses,
    activity,
    activityMetadata,
    isLoading,
    error,
    refreshData,
    loadMoreActivity,
    addFriend,
    createGroup,
    updateGroup,
    createExpense,
    createSettlement,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
};
