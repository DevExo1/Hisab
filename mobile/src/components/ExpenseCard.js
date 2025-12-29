/**
 * Expense Card Component
 * Displays a single expense with details - matches Activity page design
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
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
};

export default function ExpenseCard({ expense, isDarkMode = false, currency = 'USD', onPress }) {
  const theme = isDarkMode ? COLORS.dark : COLORS.light;
  const icon = getExpenseIcon(expense.description);

  return (
    <TouchableOpacity 
      style={[styles.activityCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardRow}>
        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor: '#FED7AA' }]}>
          <Ionicons name={icon} size={18} color="#EA580C" />
        </View>
        
        {/* Content */}
        <View style={styles.contentContainer}>
          <View style={styles.topRow}>
            <Text style={[styles.description, { color: theme.text }]}>
              {expense.description}
            </Text>
            <Text style={[styles.amount, { color: '#F97316' }]}>
              {formatCurrency(expense.amount, currency)}
            </Text>
          </View>
          
          <View style={styles.detailsRow}>
            <View style={styles.detailsLeft}>
              <View style={styles.infoRow}>
                <Ionicons name="person-sharp" size={12} color={theme.textSecondary} />
                <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                  {expense.paid_by_name || 'Unknown'}
                </Text>
              </View>
              {expense.group_name && (
                <View style={styles.infoRow}>
                  <Ionicons name="people-sharp" size={12} color={theme.textSecondary} />
                  <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                    {expense.group_name}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.detailsRight}>
              <Text style={[styles.dateText, { color: theme.textSecondary }]}>
                {formatDate(expense.expense_date || expense.date)}
              </Text>
            </View>
          </View>

          {/* Optional: Show you owe / owed info */}
          {(expense.youOwe > 0 || expense.youAreOwed > 0) && (
            <View style={styles.statusRow}>
              {expense.youOwe > 0 && (
                <View style={[styles.statusBadge, { backgroundColor: isDarkMode ? '#991B1B' : '#FEE2E2' }]}>
                  <Text style={[styles.statusText, { color: isDarkMode ? '#FCA5A5' : '#DC2626' }]}>
                    You owe {formatCurrency(expense.youOwe, currency)}
                  </Text>
                </View>
              )}
              {expense.youAreOwed > 0 && (
                <View style={[styles.statusBadge, { backgroundColor: isDarkMode ? '#065F46' : '#D1FAE5' }]}>
                  <Text style={[styles.statusText, { color: isDarkMode ? '#6EE7B7' : '#059669' }]}>
                    Owed {formatCurrency(expense.youAreOwed, currency)}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  activityCard: {
    borderRadius: 10,
    borderWidth: 1,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  cardRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  contentContainer: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  description: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    flex: 1,
    marginRight: SPACING.sm,
  },
  amount: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  detailsLeft: {
    flex: 1,
    gap: SPACING.xs / 2,
  },
  detailsRight: {
    alignItems: 'flex-end',
    gap: SPACING.xs / 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs / 2,
  },
  infoText: {
    fontSize: FONT_SIZES.xs,
    flex: 1,
  },
  dateText: {
    fontSize: FONT_SIZES.xs,
  },
  statusRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
    flexWrap: 'wrap',
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
});
