/**
 * Data Context
 * Manages app data (friends, groups, expenses, etc.)
 */

import React, { createContext, useState, useContext, useEffect } from 'react';
import apiClient from '../api/client';
import { useAuth } from './AuthContext';

const DataContext = createContext({});

export const DataProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  const [friends, setFriends] = useState([]);
  const [groups, setGroups] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [activity, setActivity] = useState([]);
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
      const [friendsData, groupsData, expensesData, activityData] = await Promise.all([
        apiClient.getFriends(),
        apiClient.getGroups(),
        apiClient.getExpenses(),
        apiClient.getActivity(),
      ]);
      
      setFriends(friendsData);
      setGroups(groupsData);
      setExpenses(expensesData);
      setActivity(activityData);
    } catch (err) {
      setError(err.message);
      console.error('Failed to load data:', err);
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

  const value = {
    friends,
    groups,
    expenses,
    activity,
    isLoading,
    error,
    refreshData,
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
