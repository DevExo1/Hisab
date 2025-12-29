/**
 * Sync Status Indicator
 * Shows sync status, last sync time, and provides manual sync button
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSync } from '../contexts/SyncContext';
import { COLORS, SPACING, FONT_SIZES } from '../constants/theme';

export default function SyncStatusIndicator({ isDarkMode = false }) {
  const { isSyncing, lastSyncTime, isOnline, hasNewData, manualSync } = useSync();
  const theme = isDarkMode ? COLORS.dark : COLORS.light;

  const getTimeSince = (timestamp) => {
    if (!timestamp) return 'Never';
    
    const now = new Date();
    const syncTime = new Date(timestamp);
    const seconds = Math.floor((now - syncTime) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const handleManualSync = () => {
    if (!isSyncing && isOnline) {
      manualSync();
    }
  };

  return (
    <View style={styles.container}>
      {/* Sync Status Icon */}
      <TouchableOpacity
        onPress={handleManualSync}
        disabled={isSyncing || !isOnline}
        style={styles.syncButton}
      >
        {isSyncing ? (
          <ActivityIndicator size="small" color={COLORS.primary} />
        ) : (
          <Ionicons
            name={isOnline ? 'sync' : 'cloud-offline'}
            size={18}
            color={isOnline ? COLORS.primary : theme.textTertiary}
          />
        )}
      </TouchableOpacity>

      {/* Last Sync Time */}
      <Text style={[styles.syncText, { color: theme.textSecondary }]}>
        {isSyncing ? 'Syncing...' : getTimeSince(lastSyncTime)}
      </Text>

      {/* New Data Indicator */}
      {hasNewData && (
        <View style={styles.newDataDot} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xs,
  },
  syncButton: {
    padding: SPACING.xs,
  },
  syncText: {
    fontSize: FONT_SIZES.xs,
    marginLeft: SPACING.xs,
  },
  newDataDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.success,
    marginLeft: SPACING.xs,
  },
});
