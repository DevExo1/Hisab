/**
 * Balance Card Component
 * Displays overall balance (owed and owing)
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { formatCurrency } from '../utils/currency';

export default function BalanceCard({ youOwe = 0, youAreOwed = 0, isDarkMode = false, currency = 'USD' }) {
  const theme = isDarkMode ? COLORS.dark : COLORS.light;
  const totalBalance = youAreOwed - youOwe;

  return (
    <View style={[styles.container, { backgroundColor: theme.surface }, SHADOWS.large]}>
      <Text style={[styles.title, { color: theme.text }]}>Your Balance</Text>
      
      <View style={styles.balancesRow}>
        {/* You Are Owed */}
        <View style={styles.balanceItem}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryDark]}
            style={styles.amountGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.amountText}>{formatCurrency(youAreOwed, currency)}</Text>
          </LinearGradient>
          <Text style={[styles.label, { color: theme.textSecondary }]}>You are owed</Text>
        </View>

        {/* You Owe */}
        <View style={styles.balanceItem}>
          <LinearGradient
            colors={[COLORS.orange, '#F59E0B']}
            style={styles.amountGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.amountText}>{formatCurrency(youOwe, currency)}</Text>
          </LinearGradient>
          <Text style={[styles.label, { color: theme.textSecondary }]}>You owe</Text>
        </View>
      </View>

      {/* Total Balance */}
      <View style={[styles.divider, { backgroundColor: theme.border }]} />
      <View style={styles.totalSection}>
        <Text style={[styles.totalAmount, { color: totalBalance >= 0 ? COLORS.primary : COLORS.coral }]}>
          {formatCurrency(Math.abs(totalBalance), currency)}
        </Text>
        <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>
          {totalBalance === 0 ? 'Settled up' : totalBalance > 0 ? 'Total you are owed' : 'Total you owe'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  balancesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.sm,
  },
  balanceItem: {
    alignItems: 'center',
  },
  amountGradient: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.xs,
    minWidth: 100,
    alignItems: 'center',
  },
  amountText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
    color: '#FFFFFF',
  },
  label: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.medium,
  },
  divider: {
    height: 1,
    marginVertical: SPACING.sm,
  },
  totalSection: {
    alignItems: 'center',
  },
  totalAmount: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    marginBottom: SPACING.xs,
  },
  totalLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.medium,
  },
});
