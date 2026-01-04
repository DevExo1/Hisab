/**
 * Activity Item Component
 * Displays expense or settlement activity with expandable details
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES } from '../constants/theme';
import { formatCurrency } from '../utils/currency';

export default function ActivityItem({ activity, theme, isDarkMode, currency = 'USD' }) {
  const [showDetails, setShowDetails] = useState(false);

  const formatDate = (date) => {
    const activityDate = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now - activityDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return activityDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return activityDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const renderExpenseActivity = () => {
    const participantCount = activity.participant_count || activity.participants?.length || 0;
    
    return (
      <View style={[styles.activityCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.cardRow}>
          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: '#FED7AA' }]}>
            <Ionicons name="wallet-sharp" size={18} color="#EA580C" />
          </View>
          
          {/* Content */}
          <View style={styles.contentContainer}>
            <View style={styles.topRow}>
              <Text style={[styles.description, { color: theme.text }]}>
                {activity.description}
              </Text>
              <Text style={[styles.amount, { color: '#F97316' }]}>
                {formatCurrency(activity.amount, currency)}
              </Text>
            </View>
            
            <View style={styles.detailsRow}>
              <View style={styles.detailsLeft}>
                <View style={styles.infoRow}>
                  <Ionicons name="person-sharp" size={12} color={theme.textSecondary} />
                  <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                    {activity.paid_by_name}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="people-sharp" size={12} color={theme.textSecondary} />
                  <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                    {activity.group_name}
                  </Text>
                </View>
              </View>
              <View style={styles.detailsRight}>
                <View style={[styles.participantBadge, { backgroundColor: isDarkMode ? '#374151' : '#F3F4F6' }]}>
                  <Ionicons name="people" size={10} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                  <Text style={[styles.participantText, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                    {participantCount}
                  </Text>
                </View>
                <Text style={[styles.dateText, { color: theme.textSecondary }]}>
                  {formatDate(activity.date)}
                </Text>
              </View>
            </View>

            {activity.participants && activity.participants.length > 0 && (
              <>
                <TouchableOpacity 
                  onPress={() => setShowDetails(!showDetails)}
                  style={styles.expandButton}
                >
                  <Ionicons 
                    name={showDetails ? 'chevron-up' : 'chevron-down'} 
                    size={14} 
                    color={isDarkMode ? '#60A5FA' : '#2563EB'} 
                  />
                  <Text style={[styles.expandText, { color: isDarkMode ? '#60A5FA' : '#2563EB' }]}>
                    {showDetails ? 'Hide' : 'View'} split
                  </Text>
                </TouchableOpacity>
                
                {showDetails && (
                  <View style={[styles.splitContainer, { borderTopColor: theme.border, backgroundColor: isDarkMode ? '#1F2937' : '#F9FAFB' }]}>
                    {activity.participants.map((participant, idx) => (
                      <View key={idx} style={styles.splitItem}>
                        <Text style={[styles.splitName, { color: theme.text }]}>
                          {participant.user_name}
                        </Text>
                        <Text style={[styles.splitAmount, { color: theme.textSecondary }]}>
                          {formatCurrency(participant.amount, currency)}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderSettlementActivity = () => {
    return (
      <View style={[styles.activityCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.cardRow}>
          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: '#A7F3D0' }]}>
            <Ionicons name="checkmark-done-sharp" size={18} color="#059669" />
          </View>
          
          {/* Content */}
          <View style={styles.contentContainer}>
            <View style={styles.topRow}>
              <Text style={[styles.description, { color: theme.text }]}>
                Settlement Payment
              </Text>
              <Text style={[styles.amount, { color: '#10B981' }]}>
                {formatCurrency(activity.amount, currency)}
              </Text>
            </View>
            
            <View style={styles.detailsRow}>
              <View style={styles.detailsLeft}>
                <View style={styles.infoRow}>
                  <Ionicons name="arrow-forward" size={12} color={theme.textSecondary} />
                  <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                    {activity.payer_name} → {activity.payee_name}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="people-sharp" size={12} color={theme.textSecondary} />
                  <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                    {activity.group_name}
                  </Text>
                </View>
              </View>
              <View style={styles.detailsRight}>
                <Text style={[styles.dateText, { color: theme.textSecondary }]}>
                  {formatDate(activity.date)}
                </Text>
              </View>
            </View>

            {activity.notes && (
              <View style={[styles.notesBox, { backgroundColor: isDarkMode ? '#1F2937' : '#F9FAFB', borderLeftColor: '#10B981' }]}>
                <Ionicons name="document-text" size={12} color={theme.textSecondary} style={styles.notesIcon} />
                <Text style={[styles.notesText, { color: theme.text }]}>
                  {activity.notes}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  return activity.type === 'expense' ? renderExpenseActivity() : renderSettlementActivity();
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
  participantBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 3,
  },
  participantText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
  dateText: {
    fontSize: FONT_SIZES.xs,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs / 2,
    marginTop: SPACING.sm,
  },
  expandText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
  splitContainer: {
    marginTop: SPACING.sm,
    borderTopWidth: 1,
    paddingTop: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    paddingBottom: SPACING.xs,
    borderRadius: 6,
  },
  splitItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs / 2,
  },
  splitName: {
    fontSize: FONT_SIZES.xs,
    flex: 1,
  },
  splitAmount: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
  notesBox: {
    marginTop: SPACING.sm,
    padding: SPACING.sm,
    borderRadius: 6,
    borderLeftWidth: 3,
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  notesIcon: {
    marginTop: 2,
  },
  notesText: {
    fontSize: FONT_SIZES.xs,
    flex: 1,
    lineHeight: 16,
  },
});
