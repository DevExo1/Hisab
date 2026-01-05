/**
 * Sync Context
 * Manages automatic data synchronization with adaptive polling
 */

import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../api/client';
import { useAuth } from './AuthContext';

const SyncContext = createContext({});

// Polling intervals in milliseconds
const POLLING_INTERVALS = {
  ACTIVE: 15000,      // 15 seconds when app is active
  IDLE: 30000,        // 30 seconds when app is idle
  BACKGROUND: 60000,  // 60 seconds in background (optional)
  DISABLED: null,     // No polling
};

const LAST_SYNC_KEY = 'lastSyncTimestamp';

export const SyncProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [syncError, setSyncError] = useState(null);
  const [isOnline, setIsOnline] = useState(true);
  const [hasNewData, setHasNewData] = useState(false);
  const [syncPaused, setSyncPaused] = useState(false);
  
  const syncIntervalRef = useRef(null);
  const appStateRef = useRef(AppState.currentState);
  const syncCallbacksRef = useRef([]);
  
  // Load last sync time from storage
  useEffect(() => {
    loadLastSyncTime();
  }, []);
  
  // Monitor network connectivity
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected);
    });
    
    return () => unsubscribe();
  }, []);
  
  // Monitor app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription?.remove();
    };
  }, [isAuthenticated, isOnline]);
  
  // Start/stop polling based on auth and network status
  useEffect(() => {
    if (isAuthenticated && isOnline) {
      startPolling(POLLING_INTERVALS.ACTIVE);
    } else {
      stopPolling();
    }
    
    return () => stopPolling();
  }, [isAuthenticated, isOnline]);
  
  const loadLastSyncTime = async () => {
    try {
      const timestamp = await AsyncStorage.getItem(LAST_SYNC_KEY);
      if (timestamp) {
        setLastSyncTime(timestamp);
      }
    } catch (error) {
      console.error('Error loading last sync time:', error);
    }
  };
  
  const saveLastSyncTime = async (timestamp) => {
    try {
      await AsyncStorage.setItem(LAST_SYNC_KEY, timestamp);
      setLastSyncTime(timestamp);
    } catch (error) {
      console.error('Error saving last sync time:', error);
    }
  };
  
  const handleAppStateChange = (nextAppState) => {
    const prevAppState = appStateRef.current;
    appStateRef.current = nextAppState;
    
    if (!isAuthenticated || !isOnline) return;
    
    // App coming to foreground
    if (prevAppState.match(/inactive|background/) && nextAppState === 'active') {
      // Immediate sync when app comes to foreground
      performSync();
      startPolling(POLLING_INTERVALS.ACTIVE);
    }
    // App going to background
    else if (prevAppState === 'active' && nextAppState.match(/inactive|background/)) {
      // Slower polling in background (optional - can be disabled to save battery)
      startPolling(POLLING_INTERVALS.BACKGROUND);
    }
  };
  
  const startPolling = (interval) => {
    stopPolling();
    
    if (!interval) return;
    
    syncIntervalRef.current = setInterval(() => {
      performSync();
    }, interval);
  };
  
  const stopPolling = () => {
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
      syncIntervalRef.current = null;
    }
  };
  
  const performSync = async (forceFullSync = false) => {
    if (isSyncing || !isAuthenticated || !isOnline || syncPaused) return;
    
    setIsSyncing(true);
    setHasNewData(false);
    setSyncError(null);
    
    try {
      // Use last sync time unless forcing full sync
      const sinceTimestamp = forceFullSync ? null : lastSyncTime;
      
      const response = await apiClient.getSyncChanges(sinceTimestamp);
      
      if (response.has_changes) {
        // Notify all registered callbacks with the changes
        syncCallbacksRef.current.forEach(callback => {
          try {
            callback(response.changes);
          } catch (error) {
            console.error('Error in sync callback:', error);
          }
        });
        
        setHasNewData(true);
        
        // Auto-hide new data indicator after 3 seconds
        setTimeout(() => setHasNewData(false), 3000);
      }
      
      // Save server time as last sync time
      await saveLastSyncTime(response.server_time);
      
    } catch (error) {
      console.error('Sync error:', error);
      setSyncError(error.message);
    } finally {
      setIsSyncing(false);
    }
  };
  
  // Register a callback to be notified of sync changes
  const registerSyncCallback = (callback) => {
    syncCallbacksRef.current.push(callback);
    
    // Return unregister function
    return () => {
      syncCallbacksRef.current = syncCallbacksRef.current.filter(cb => cb !== callback);
    };
  };
  
  // Register a callback for full refresh (called on manual sync)
  const fullRefreshCallbackRef = useRef(null);
  
  const registerFullRefreshCallback = (callback) => {
    fullRefreshCallbackRef.current = callback;
  };
  
  // Manual sync trigger - now also triggers full data refresh
  const manualSync = async () => {
    // First do the incremental sync
    await performSync(false);
    
    // Then trigger full data refresh if callback is registered
    if (fullRefreshCallbackRef.current) {
      try {
        await fullRefreshCallbackRef.current();
      } catch (error) {
        console.error('Error during full refresh:', error);
      }
    }
  };
  
  // Force full sync (ignores lastSyncTime)
  const fullSync = async () => {
    await performSync(true);
    
    // Also trigger full data refresh
    if (fullRefreshCallbackRef.current) {
      try {
        await fullRefreshCallbackRef.current();
      } catch (error) {
        console.error('Error during full refresh:', error);
      }
    }
  };
  
  // Pause sync (useful when user is actively interacting with forms/modals)
  const pauseSync = () => {
    setSyncPaused(true);
  };
  
  // Resume sync
  const resumeSync = () => {
    setSyncPaused(false);
    // Trigger immediate sync when resuming
    performSync();
  };
  
  const value = {
    isSyncing,
    lastSyncTime,
    syncError,
    isOnline,
    hasNewData,
    syncPaused,
    manualSync,
    fullSync,
    pauseSync,
    resumeSync,
    registerSyncCallback,
    registerFullRefreshCallback,
  };
  
  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
};

export const useSync = () => {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSync must be used within SyncProvider');
  }
  return context;
};
