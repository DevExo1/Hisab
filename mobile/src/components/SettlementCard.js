/**
 * Settlement Card Component
 * Displays a single settlement transaction
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { formatCurrency } from '../utils/currency';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function SettlementCard({ settlement, isDarkMode = false, currency = 'USD', members = [] }) {
  const theme = isDarkMode ? COLORS.dark : COLORS.light;

  // Get member names from IDs
  const getUsername = (userId) => {
    const member = members.find(m => m.user_id === userId || m.id === userId);
    return member?.user_name || member?.name || 'Unknown';
  };

  const payerName = getUsername(settlement.payer_id);
  const payeeName = getUsername(settlement.payee_id);

  return (
    <View 
      style={[styles.container, { backgroundColor: theme.surface, borderColor: theme.border }, SHADOWS.small]}
    >
      <View style={styles.content}>
        {/* Left: Icon and Details */}
        <View style={styles.leftSection}>
          <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)' }]}>
            <Ionicons name="checkmark-done-sharp" size={20} color="#10B981" />
          </View>
          
          <View style={styles.details}>
            <Text style={[styles.description, { color: theme.text }]} numberOfLines={1}>
              {settlement.description}
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]} numberOfLines={1}>
              <Text style={styles.bold}>{payerName}</Text> paid <Text style={styles.bold}>{payeeName}</Text> • {formatDate(settlement.date)}
            </Text>
            <View style={[styles.badge, { backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)' }]}>
              <Ionicons name="checkmark-sharp" size={12} color="#10B981" style={styles.badgeIcon} />
              <Text style={[styles.badgeText, { color: '#10B981' }]}>Settlement</Text>
            </View>
          </View>
        </View>

        {/* Right: Amount */}
        <View style={styles.rightSection}>
          <Text style={[styles.amount, { color: '#10B981' }]}>
            {formatCurrency(settlement.amount, currency)}
          </Text>
          <Text style={[styles.statusText, { color: '#10B981' }]}>
            Paid
          </Text>
        </View>
      </View>
    </View>
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
  bold: {
    fontWeight: FONT_WEIGHTS.semibold,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.xs,
    marginTop: 2,
  },
  badgeIcon: {
    marginRight: 4,
  },
  badgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.medium,
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
