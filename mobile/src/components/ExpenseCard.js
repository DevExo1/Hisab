/**
 * Expense Card Component
 * Displays a single expense with details
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { formatCurrency } from '../utils/currency';

const getExpenseIcon = (description) => {
  const lowerDesc = description.toLowerCase();
  if (lowerDesc.includes('dinner') || lowerDesc.includes('restaurant') || lowerDesc.includes('food')) return 'restaurant-sharp';
  if (lowerDesc.includes('uber') || lowerDesc.includes('taxi') || lowerDesc.includes('transport')) return 'car-sharp';
  if (lowerDesc.includes('grocery') || lowerDesc.includes('groceries')) return 'cart-sharp';
  if (lowerDesc.includes('movie') || lowerDesc.includes('cinema')) return 'film-sharp';
  if (lowerDesc.includes('coffee') || lowerDesc.includes('cafe')) return 'cafe-sharp';
  if (lowerDesc.includes('rent')) return 'home-sharp';
  if (lowerDesc.includes('electricity') || lowerDesc.includes('bill') || lowerDesc.includes('utility')) return 'flash-sharp';
  if (lowerDesc.includes('flight') || lowerDesc.includes('ticket')) return 'airplane-sharp';
  return 'receipt-sharp';
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function ExpenseCard({ expense, isDarkMode = false, currency = 'USD', onPress }) {
  const theme = isDarkMode ? COLORS.dark : COLORS.light;
  const icon = getExpenseIcon(expense.description);

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: theme.surface, borderColor: theme.border }, SHADOWS.small]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        {/* Left: Icon and Details */}
        <View style={styles.leftSection}>
          <View style={[styles.iconContainer, { backgroundColor: theme.surfaceSecondary }]}>
            <Ionicons name={icon} size={20} color={COLORS.primary} />
          </View>
          
          <View style={styles.details}>
            <Text style={[styles.description, { color: theme.text }]} numberOfLines={1}>
              {expense.description}
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]} numberOfLines={1}>
              {expense.paid_by_name || 'Unknown'} • {formatDate(expense.expense_date || expense.date)}
            </Text>
            {expense.group_name && (
              <Text style={[styles.groupText, { color: theme.textTertiary }]} numberOfLines={1}>
                {expense.group_name}
              </Text>
            )}
          </View>
        </View>

        {/* Right: Amount */}
        <View style={styles.rightSection}>
          <Text style={[styles.amount, { color: theme.text }]}>
            {formatCurrency(expense.amount, currency)}
          </Text>
          {expense.youOwe > 0 && (
            <Text style={[styles.statusText, { color: COLORS.coral }]}>
              You owe {formatCurrency(expense.youOwe, currency)}
            </Text>
          )}
          {expense.youAreOwed > 0 && (
            <Text style={[styles.statusText, { color: COLORS.primary }]}>
              Owed {formatCurrency(expense.youAreOwed, currency)}
            </Text>
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
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  details: {
    flex: 1,
  },
  description: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    marginBottom: 2,
  },
  groupText: {
    fontSize: FONT_SIZES.xs,
    marginTop: 2,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
    marginBottom: 2,
  },
  statusText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.medium,
  },
});
