/**
 * Balance Card Component
 * Displays overall balance (owed and owing) with multi-currency support
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { formatCurrency } from '../utils/currency';

export default function BalanceCard({ youOwe = {}, youAreOwed = {}, isDarkMode = false, currency = 'USD', currencies = [] }) {
  const theme = isDarkMode ? COLORS.dark : COLORS.light;
  
  // Handle both old format (number) and new format (object)
  const isMultiCurrency = typeof youOwe === 'object' && typeof youAreOwed === 'object';
  
  if (!isMultiCurrency) {
    // Fallback for old format
    const totalBalance = youAreOwed - youOwe;
    return (
      <View style={[styles.container, { backgroundColor: theme.surface }, SHADOWS.large]}>
        <Text style={[styles.title, { color: theme.text }]}>Your Balance</Text>
        
        <View style={styles.balancesRow}>
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

  // Multi-currency display
  const activeCurrencies = currencies.length > 0 ? currencies : Object.keys({...youOwe, ...youAreOwed});
  
  return (
    <View style={[styles.container, { backgroundColor: theme.surface }, SHADOWS.large]}>
      <Text style={[styles.title, { color: theme.text }]}>Your Balance</Text>
      
      {activeCurrencies.length === 0 ? (
        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No balance yet</Text>
      ) : (
        activeCurrencies.map((curr, index) => {
          const owed = youAreOwed[curr] || 0;
          const owing = youOwe[curr] || 0;
          const netBalance = owed - owing;
          
          return (
            <View key={curr}>
              {activeCurrencies.length > 1 && (
                <View style={styles.currencyHeader}>
                  <Text style={[styles.currencyLabel, { color: theme.textSecondary }]}>{curr}</Text>
                </View>
              )}
              
              <View style={styles.balancesRow}>
                <View style={styles.balanceItem}>
                  <LinearGradient
                    colors={[COLORS.primary, COLORS.primaryDark]}
                    style={styles.amountGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={styles.amountText}>{formatCurrency(owed, curr)}</Text>
                  </LinearGradient>
                  <Text style={[styles.label, { color: theme.textSecondary }]}>You are owed</Text>
                </View>

                <View style={styles.balanceItem}>
                  <LinearGradient
                    colors={[COLORS.orange, '#F59E0B']}
                    style={styles.amountGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={styles.amountText}>{formatCurrency(owing, curr)}</Text>
                  </LinearGradient>
                  <Text style={[styles.label, { color: theme.textSecondary }]}>You owe</Text>
                </View>
              </View>

              <View style={styles.totalSection}>
                {netBalance === 0 ? (
                  <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>Settled up</Text>
                ) : (
                  <>
                    <Text style={[styles.totalAmount, { color: netBalance >= 0 ? COLORS.primary : COLORS.coral }]}>
                      {formatCurrency(Math.abs(netBalance), curr)}
                    </Text>
                    <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>
                      {netBalance > 0 ? 'net owed to you' : 'net you owe'}
                    </Text>
                  </>
                )}
              </View>
              
              {index < activeCurrencies.length - 1 && (
                <View style={[styles.divider, { backgroundColor: theme.border }]} />
              )}
            </View>
          );
        })
      )}
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
  emptyText: {
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
    paddingVertical: SPACING.md,
  },
  currencyHeader: {
    alignItems: 'center',
    marginTop: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  currencyLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.bold,
    letterSpacing: 1,
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
    marginBottom: SPACING.xs,
  },
  totalAmount: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    marginBottom: SPACING.xs / 2,
  },
  totalLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.medium,
  },
});
