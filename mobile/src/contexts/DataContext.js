/**
 * Data Context
 * Manages app data (friends, groups, expenses, etc.)
 */

import React, { createContext, useState, useContext, useEffect } from 'react';
import { Alert } from 'react-native';
import apiClient from '../api/client';
import { useAuth } from './AuthContext';
import { useSync } from './SyncContext';

const DataContext = createContext({});

export const DataProvider = ({ children }) => {
  const { isAuthenticated, logout } = useAuth();
  const { registerSyncCallback, registerFullRefreshCallback } = useSync();
  
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

  // Register for sync updates
  useEffect(() => {
    if (!isAuthenticated || !registerSyncCallback) return;
    
    const unregister = registerSyncCallback(handleSyncChanges);
    return () => unregister();
  }, [isAuthenticated, registerSyncCallback]);

  // Register full refresh callback for manual sync button
  useEffect(() => {
    if (registerFullRefreshCallback) {
      registerFullRefreshCallback(loadAllData);
    }
  }, [registerFullRefreshCallback]);

  // Handle incremental sync changes
  const handleSyncChanges = async (changes) => {
    try {
      // Merge groups - but need to fetch balances for updated groups
      if (changes.groups && changes.groups.length > 0) {
        // Fetch fresh data with balances for changed groups
        const groupsWithBalances = await Promise.all(
          changes.groups.map(async (group) => {
            try {
              const balanceData = await apiClient.getGroupBalances(group.id);
              const currentUser = await apiClient.getCurrentUser();
              const userBalance = balanceData.balances?.find(
                b => b.user_id === currentUser?.id
              );
              
              return {
                ...group,
                balance: userBalance?.balance || 0,
                current_user_id: currentUser?.id,
                balances: balanceData.balances || [],
                settlements: balanceData.settlements || [],
              };
            } catch (error) {
              console.error(`Failed to load balance for group ${group.id}:`, error);
              return {
                ...group,
                balance: 0,
                balances: [],
                settlements: [],
              };
            }
          })
        );
        
        setGroups(prevGroups => {
          const updatedGroups = [...prevGroups];
          groupsWithBalances.forEach(newGroup => {
            const index = updatedGroups.findIndex(g => g.id === newGroup.id);
            if (index >= 0) {
              updatedGroups[index] = newGroup;
            } else {
              updatedGroups.push(newGroup);
            }
          });
          return updatedGroups;
        });
      }

      // Merge expenses
      if (changes.expenses && changes.expenses.length > 0) {
        setExpenses(prevExpenses => {
          const updatedExpenses = [...prevExpenses];
          changes.expenses.forEach(newExpense => {
            const index = updatedExpenses.findIndex(e => e.id === newExpense.id);
            if (index >= 0) {
              updatedExpenses[index] = newExpense;
            } else {
              updatedExpenses.unshift(newExpense);
            }
          });
          return updatedExpenses;
        });
      }

      // Merge friends
      if (changes.friends && changes.friends.length > 0) {
        setFriends(prevFriends => {
          const updatedFriends = [...prevFriends];
          changes.friends.forEach(newFriend => {
            const index = updatedFriends.findIndex(f => f.id === newFriend.id);
            if (index >= 0) {
              updatedFriends[index] = newFriend;
            } else {
              updatedFriends.push(newFriend);
            }
          });
          return updatedFriends;
        });
      }

      // Merge activity
      if (changes.activity && changes.activity.length > 0) {
        setActivity(prevActivity => {
          const updatedActivity = [...prevActivity];
          changes.activity.forEach(newItem => {
            const index = updatedActivity.findIndex(
              a => a.id === newItem.id && a.type === newItem.type
            );
            if (index < 0) {
              updatedActivity.unshift(newItem);
            }
          });
          // Keep only latest 50 items to prevent memory issues
          return updatedActivity.slice(0, 50);
        });
      }
    } catch (error) {
      console.error('Error handling sync changes:', error);
    }
  };

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
      return true;
    } catch (err) {
      // Handle authentication errors
      if (err.isAuthError) {
        Alert.alert('Session Expired', err.message, [
          { text: 'OK', onPress: () => logout() }
        ]);
        return false;
      }
      
      // Handle network errors
      if (err.isNetworkError) {
        Alert.alert('Connection Error', err.message);
      }
      
      setError(err.message);
      return false;
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
