/**
 * Friend Card Component
 * Displays a friend with balance information
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { formatCurrency } from '../utils/currency';

export default function FriendCard({ friend, isDarkMode = false, currency = 'USD', onPress }) {
  const theme = isDarkMode ? COLORS.dark : COLORS.light;

  const getBalanceColor = (balance) => {
    if (balance > 0) return COLORS.primary; // They owe you (positive)
    if (balance < 0) return COLORS.orange; // You owe them (negative)
    return theme.textSecondary; // Settled
  };

  const getBalanceText = (balance) => {
    if (Number(balance || 0) === 0) return null; // Don't show label for settled
    if (balance > 0) return 'owes you'; // Positive = they owe you
    return 'you owe'; // Negative = you owe them
  };

  const getStatusBadge = () => {
    if (!friend.status) return null;
    
    const isJoined = friend.status === 'joined';
    return (
      <View style={styles.statusBadge}>
        <Text style={[styles.statusText, { color: isJoined ? COLORS.primary : COLORS.orange }]}>
          {isJoined ? '✓ Joined' : '⏳ Invitation sent'}
        </Text>
      </View>
    );
  };

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: theme.surface, borderColor: theme.border }, SHADOWS.small]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        {/* Left: Avatar and Info */}
        <View style={styles.leftSection}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryDark]}
            style={styles.avatar}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.avatarText}>{friend.name?.charAt(0)?.toUpperCase() || '?'}</Text>
          </LinearGradient>
          
          <View style={styles.info}>
            <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
              {friend.name}
            </Text>
            <Text style={[styles.email, { color: theme.textSecondary }]} numberOfLines={1}>
              {friend.email}
            </Text>
            {getStatusBadge()}
          </View>
        </View>

        {/* Right: Balance */}
        <View style={styles.rightSection}>
          {Number(friend.balance || 0) !== 0 && (
            <>
              <Text style={[styles.balanceAmount, { color: getBalanceColor(friend.balance) }]}>
                {friend.balance > 0 ? '+' : ''}{formatCurrency(Math.abs(Number(friend.balance || 0)), currency)}
              </Text>
              <Text style={[styles.balanceLabel, { color: theme.textSecondary }]}>
                {getBalanceText(friend.balance)}
              </Text>
            </>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: SPACING.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  avatarText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: '#FFFFFF',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    marginBottom: 2,
  },
  email: {
    fontSize: FONT_SIZES.sm,
    marginBottom: 2,
  },
  statusBadge: {
    marginTop: 2,
  },
  statusText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.medium,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  balanceAmount: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    marginBottom: 2,
  },
  balanceLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.medium,
  },
});
