/**
 * Group Card Component
 * Displays a group with balance information
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { formatCurrency } from '../utils/currency';

const getGroupEmoji = (name) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('trip') || lowerName.includes('travel')) return '✈️';
  if (lowerName.includes('house') || lowerName.includes('home') || lowerName.includes('apartment')) return '🏠';
  if (lowerName.includes('party') || lowerName.includes('celebration')) return '🎉';
  if (lowerName.includes('family')) return '👨‍👩‍👧‍👦';
  if (lowerName.includes('friends')) return '👥';
  if (lowerName.includes('work') || lowerName.includes('office')) return '💼';
  return '👥';
};

export default function GroupCard({ group, isDarkMode = false, currency = 'USD', onPress }) {
  const theme = isDarkMode ? COLORS.dark : COLORS.light;
  const emoji = getGroupEmoji(group.name);
  
  // Calculate balance from group's balances array if available
  let userBalance = 0;
  if (group.balances && Array.isArray(group.balances)) {
    const currentUserBalance = group.balances.find(b => b.user_id === group.current_user_id);
    if (currentUserBalance) {
      userBalance = currentUserBalance.balance;
    }
  } else if (group.balance !== undefined) {
    userBalance = group.balance;
  }

  const memberCount = group.members?.length || 0;

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: theme.surface }, SHADOWS.medium]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        {/* Icon and Name */}
        <View style={styles.leftSection}>
          <View style={[styles.iconContainer, { backgroundColor: theme.surfaceSecondary }]}>
            <Text style={styles.emoji}>{emoji}</Text>
          </View>
          
          <View style={styles.details}>
            <Text style={[styles.groupName, { color: theme.text }]} numberOfLines={1}>
              {group.name}
            </Text>
            <Text style={[styles.memberCount, { color: theme.textSecondary }]}>
              {memberCount} {memberCount === 1 ? 'member' : 'members'}
            </Text>
          </View>
        </View>

        {/* Balance */}
        <View style={styles.rightSection}>
          {userBalance === 0 ? (
            <Text style={[styles.settledText, { color: theme.textTertiary }]}>Settled up</Text>
          ) : (
            <>
              <Text style={[styles.balanceAmount, { color: userBalance > 0 ? COLORS.primary : COLORS.coral }]}>
                {formatCurrency(Math.abs(userBalance), currency)}
              </Text>
              <Text style={[styles.balanceLabel, { color: theme.textSecondary }]}>
                {userBalance > 0 ? 'you are owed' : 'you owe'}
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
    padding: SPACING.sm,
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
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  emoji: {
    fontSize: 24,
  },
  details: {
    flex: 1,
  },
  groupName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    marginBottom: SPACING.xs,
  },
  memberCount: {
    fontSize: FONT_SIZES.sm,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  balanceAmount: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    marginBottom: 2,
  },
  balanceLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.medium,
  },
  settledText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
  },
});
