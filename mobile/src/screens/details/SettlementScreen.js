/**
 * Settlement Screen
 * Settle up debts within a group
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { formatCurrency } from '../../utils/currency';
import apiClient from '../../api/client';

export default function SettlementScreen({ route, navigation }) {
  const { groupId } = route.params;
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const theme = isDarkMode ? COLORS.dark : COLORS.light;

  const [viewType, setViewType] = useState('simplified'); // 'simplified' or 'detailed'
  const [simplifiedSettlements, setSimplifiedSettlements] = useState([]);
  const [pairwiseData, setPairwiseData] = useState([]);
  const [group, setGroup] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unlockedPayments, setUnlockedPayments] = useState(new Set());
  
  // Get the locked settlement method from group
  const lockedMethod = group?.settlement_method || null;

  useEffect(() => {
    loadData();
  }, [groupId, viewType]);
  
  // Update viewType when group loads with a locked method
  useEffect(() => {
    if (group?.settlement_method && viewType !== group.settlement_method) {
      setViewType(group.settlement_method);
    }
  }, [group?.settlement_method]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Load group info
      const groups = await apiClient.getGroups();
      const foundGroup = groups.find(g => g.id === groupId);
      setGroup(foundGroup);

      if (viewType === 'detailed') {
        // Load pairwise balances
        const data = await apiClient.getGroupPairwiseBalances(groupId);
        const balances = data.pairwise_balances || [];

        // Sort: Current user's debts first, then others
        const sortedBalances = balances.sort((a, b) => {
          const aIsCurrentUser = a.from_user_id === user?.id;
          const bIsCurrentUser = b.from_user_id === user?.id;

          if (aIsCurrentUser && !bIsCurrentUser) return -1;
          if (!aIsCurrentUser && bIsCurrentUser) return 1;
          return b.total_amount - a.total_amount;
        });

        setPairwiseData(sortedBalances);
      } else {
        // Load simplified settlements
        const data = await apiClient.getGroupBalances(groupId);
        const settlements = data.settlements || [];

        // Sort: Current user's debts first, then others
        const sortedSettlements = settlements.sort((a, b) => {
          const aIsCurrentUser = a.from_user_id === user?.id;
          const bIsCurrentUser = b.from_user_id === user?.id;

          if (aIsCurrentUser && !bIsCurrentUser) return -1;
          if (!aIsCurrentUser && bIsCurrentUser) return 1;
          return b.amount - a.amount;
        });

        setSimplifiedSettlements(sortedSettlements);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load settlement data');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleUnlockPayment = (settlement) => {
    const paymentKey = `${settlement.from_user_id}-${settlement.to_user_id}`;
    setUnlockedPayments(prev => new Set([...prev, paymentKey]));
  };

  const handleSettleClick = (settlement) => {
    const isOtherUser = settlement.from_user_id !== user?.id;
    const paymentKey = `${settlement.from_user_id}-${settlement.to_user_id}`;
    
    if (isOtherUser && !unlockedPayments.has(paymentKey)) {
      return;
    }

    // Navigate to settle debt modal/screen with settlement_type
    navigation.navigate('SettleDebt', {
      groupId,
      settlement: {
        from_user_id: settlement.from_user_id,
        from_user_name: settlement.from_user_name,
        to_user_id: settlement.to_user_id,
        to_user_name: settlement.to_user_name,
        total_amount: settlement.amount || settlement.total_amount,
      },
      settlementType: viewType, // 'simplified' or 'detailed'
      currency: group?.currency || 'USD', // Pass group currency
    });
  };

  if (isLoading && !refreshing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
          Loading settlement data...
        </Text>
      </View>
    );
  }

  const settlements = viewType === 'simplified' ? simplifiedSettlements : pairwiseData;
  const userPayments = settlements.filter(s => s.from_user_id === user?.id);
  const otherPayments = settlements.filter(s => s.from_user_id !== user?.id);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
      >
        {/* View Type Toggle */}
        <View style={[styles.toggleCard, { backgroundColor: theme.surface }, SHADOWS.medium]}>
          <Text style={[styles.toggleTitle, { color: theme.text }]}>
            {lockedMethod ? 'Settlement Method (Locked)' : 'Settlement Method'}
          </Text>
          
          {/* Lock Info Banner */}
          {lockedMethod && (
            <View style={[styles.lockBanner, { 
              backgroundColor: isDarkMode ? 'rgba(251, 191, 36, 0.15)' : '#FEF3C7',
              borderColor: isDarkMode ? '#D97706' : '#F59E0B'
            }]}>
              <Text style={[styles.lockBannerText, { color: isDarkMode ? '#FCD34D' : '#92400E' }]}>
                🔒 This group is locked to {lockedMethod} settlements. The lock will reset when all debts are settled.
              </Text>
            </View>
          )}
          
          <View style={styles.toggleButtons}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                { borderColor: theme.border },
                viewType === 'simplified' && styles.toggleButtonActive,
                lockedMethod && lockedMethod !== 'simplified' && styles.toggleButtonDisabled
              ]}
              onPress={() => !lockedMethod && setViewType('simplified')}
              activeOpacity={lockedMethod && lockedMethod !== 'simplified' ? 1 : 0.7}
              disabled={lockedMethod && lockedMethod !== 'simplified'}
            >
              <LinearGradient
                colors={viewType === 'simplified' ? [COLORS.primary, COLORS.primaryDark] : ['transparent', 'transparent']}
                style={[
                  styles.toggleButtonGradient,
                  lockedMethod && lockedMethod !== 'simplified' && { opacity: 0.4 }
                ]}
              >
                <Ionicons 
                  name={lockedMethod === 'simplified' ? 'lock-closed' : lockedMethod === 'detailed' ? 'close-circle' : 'flash-sharp'}
                  size={28} 
                  color={viewType === 'simplified' ? '#FFFFFF' : lockedMethod && lockedMethod !== 'simplified' ? theme.textTertiary : theme.text} 
                  style={styles.toggleButtonIcon}
                />
                <Text style={[
                  styles.toggleButtonTitle,
                  { color: viewType === 'simplified' ? '#FFFFFF' : lockedMethod && lockedMethod !== 'simplified' ? theme.textTertiary : theme.text }
                ]}>
                  Simplified
                </Text>
                <Text style={[
                  styles.toggleButtonSubtitle,
                  { color: viewType === 'simplified' ? '#FFFFFF' : theme.textSecondary }
                ]}>
                  Minimum payments
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.toggleButton,
                { borderColor: theme.border },
                viewType === 'detailed' && styles.toggleButtonActive,
                lockedMethod && lockedMethod !== 'detailed' && styles.toggleButtonDisabled
              ]}
              onPress={() => !lockedMethod && setViewType('detailed')}
              activeOpacity={lockedMethod && lockedMethod !== 'detailed' ? 1 : 0.7}
              disabled={lockedMethod && lockedMethod !== 'detailed'}
            >
              <LinearGradient
                colors={viewType === 'detailed' ? [COLORS.primary, COLORS.primaryDark] : ['transparent', 'transparent']}
                style={[
                  styles.toggleButtonGradient,
                  lockedMethod && lockedMethod !== 'detailed' && { opacity: 0.4 }
                ]}
              >
                <Ionicons 
                  name={lockedMethod === 'detailed' ? 'lock-closed' : lockedMethod === 'simplified' ? 'close-circle' : 'list-sharp'}
                  size={28} 
                  color={viewType === 'detailed' ? '#FFFFFF' : lockedMethod && lockedMethod !== 'detailed' ? theme.textTertiary : theme.text} 
                  style={styles.toggleButtonIcon}
                />
                <Text style={[
                  styles.toggleButtonTitle,
                  { color: viewType === 'detailed' ? '#FFFFFF' : lockedMethod && lockedMethod !== 'detailed' ? theme.textTertiary : theme.text }
                ]}>
                  Detailed
                </Text>
                <Text style={[
                  styles.toggleButtonSubtitle,
                  { color: viewType === 'detailed' ? '#FFFFFF' : theme.textSecondary }
                ]}>
                  Who owes whom
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Settlement List */}
        <View style={[styles.settlementsCard, { backgroundColor: theme.surface }, SHADOWS.medium]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {viewType === 'simplified' ? 'Suggested Payments' : 'Pairwise Debts'}
          </Text>

          {settlements.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-circle-sharp" size={64} color={COLORS.success} style={styles.emptyStateIcon} />
              <Text style={[styles.emptyStateTitle, { color: theme.text }]}>
                All settled up!
              </Text>
              <Text style={[styles.emptyStateText, { color: theme.textSecondary }]}>
                No outstanding debts in this group.
              </Text>
            </View>
          ) : (
            <View style={styles.settlementsList}>
              {/* User's Payments */}
              {userPayments.length > 0 && (
                <>
                  <View style={styles.subsectionTitleContainer}>
                    <Ionicons name="card-sharp" size={18} color={COLORS.primary} style={styles.subsectionIcon} />
                    <Text style={[styles.subsectionTitle, { color: COLORS.primary }]}>
                      Your Payments ({userPayments.length})
                    </Text>
                  </View>
                  {userPayments.map((settlement, index) => (
                    <SettlementItem
                      key={`user-${index}`}
                      settlement={settlement}
                      isCurrentUser={true}
                      theme={theme}
                      currency={group?.currency}
                      onSettle={() => handleSettleClick(settlement)}
                      onUnlock={() => handleUnlockPayment(settlement)}
                      isLocked={false}
                    />
                  ))}
                </>
              )}

              {/* Other Payments */}
              {otherPayments.length > 0 && (
                <>
                  <View style={[styles.subsectionTitleContainer, { marginTop: SPACING.md }]}>
                    <Ionicons name="people-sharp" size={18} color={theme.textSecondary} style={styles.subsectionIcon} />
                    <Text style={[styles.subsectionTitle, { color: theme.textSecondary }]}>
                      Other Payments ({otherPayments.length})
                    </Text>
                  </View>
                  {otherPayments.map((settlement, index) => {
                    const paymentKey = `${settlement.from_user_id}-${settlement.to_user_id}`;
                    const isLocked = !unlockedPayments.has(paymentKey);
                    
                    return (
                      <SettlementItem
                        key={`other-${index}`}
                        settlement={settlement}
                        isCurrentUser={false}
                        theme={theme}
                        currency={group?.currency}
                        onSettle={() => handleSettleClick(settlement)}
                        onUnlock={() => handleUnlockPayment(settlement)}
                        isLocked={isLocked}
                      />
                    );
                  })}
                </>
              )}
            </View>
          )}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

// Settlement Item Component
function SettlementItem({ settlement, isCurrentUser, theme, currency, onSettle, onUnlock, isLocked }) {
  return (
    <View
      style={[
        styles.settlementItem,
        { 
          backgroundColor: isCurrentUser ? COLORS.primary + '20' : theme.surfaceSecondary,
          borderColor: isCurrentUser ? COLORS.primary + '40' : theme.border,
          opacity: isLocked ? 0.6 : 1
        }
      ]}
    >
      {isLocked && (
        <View style={styles.lockBadge}>
          <Ionicons name="lock-closed-sharp" size={16} color={theme.textSecondary} />
        </View>
      )}
      
      <View style={styles.settlementContent}>
        <View style={styles.settlementInfo}>
          {isCurrentUser && <Ionicons name="person-sharp" size={16} color={COLORS.primary} style={styles.userIcon} />}
          <Text style={[styles.settlementText, { color: theme.text }]}>
            <Text style={styles.userName}>{settlement.from_user_name}</Text>
            {' pays '}
            <Text style={[styles.amount, { color: COLORS.orange }]}>
              {formatCurrency(settlement.amount || settlement.total_amount, currency)}
            </Text>
            {' to '}
            <Text style={styles.userName}>{settlement.to_user_name}</Text>
          </Text>
        </View>

        {isLocked ? (
          <TouchableOpacity
            style={[styles.unlockButton, { backgroundColor: theme.border }]}
            onPress={onUnlock}
          >
            <Ionicons name="lock-open-sharp" size={16} color={theme.text} style={styles.unlockButtonIcon} />
            <Text style={[styles.unlockButtonText, { color: theme.text }]}>Unlock</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.settleButton}
            onPress={onSettle}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryDark]}
              style={styles.settleButtonGradient}
            >
              <Text style={styles.settleButtonText}>Settle</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.md,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
  },
  toggleCard: {
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  toggleTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
    marginBottom: SPACING.sm,
  },
  toggleButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  toggleButton: {
    flex: 1,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 2,
    overflow: 'hidden',
  },
  toggleButtonActive: {
    borderColor: COLORS.primary,
  },
  toggleButtonGradient: {
    padding: SPACING.sm,
    alignItems: 'center',
  },
  toggleButtonIcon: {
    marginBottom: SPACING.xs,
  },
  toggleButtonTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    marginBottom: 2,
  },
  toggleButtonSubtitle: {
    fontSize: FONT_SIZES.xs,
  },
  toggleButtonDisabled: {
    opacity: 0.5,
  },
  lockBanner: {
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    marginBottom: SPACING.md,
  },
  lockBannerText: {
    fontSize: FONT_SIZES.xs,
    textAlign: 'center',
  },
  settlementsCard: {
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
    marginBottom: SPACING.md,
  },
  subsectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  subsectionIcon: {
    marginRight: SPACING.xs,
  },
  subsectionTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  settlementsList: {
    gap: SPACING.sm,
  },
  settlementItem: {
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    padding: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  lockBadge: {
    position: 'absolute',
    top: SPACING.xs,
    right: SPACING.xs,
  },
  settlementContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settlementInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  userIcon: {
    marginRight: SPACING.xs,
  },
  settlementText: {
    fontSize: FONT_SIZES.sm,
    flex: 1,
    flexWrap: 'wrap',
  },
  userName: {
    fontWeight: FONT_WEIGHTS.semibold,
  },
  amount: {
    fontWeight: FONT_WEIGHTS.bold,
  },
  unlockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  unlockButtonIcon: {
    marginRight: SPACING.xs,
  },
  unlockButtonText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.medium,
  },
  settleButton: {
    borderRadius: BORDER_RADIUS.sm,
    overflow: 'hidden',
  },
  settleButtonGradient: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  settleButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyStateIcon: {
    marginBottom: SPACING.sm,
  },
  emptyStateTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    marginBottom: SPACING.xs,
  },
  emptyStateText: {
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
  },
  bottomSpacer: {
    height: SPACING.xl,
  },
});
