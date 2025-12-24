/**
 * Group Details Screen
 * Shows group balance, members, and expenses
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { formatCurrency } from '../../utils/currency';
import ExpenseCard from '../../components/ExpenseCard';
import SettlementCard from '../../components/SettlementCard';
import AddExpenseModal from '../../components/AddExpenseModal';
import EditGroupModal from '../../components/EditGroupModal';
import apiClient from '../../api/client';

export default function GroupDetailsScreen({ route, navigation }) {
  const { groupId } = route.params;
  const { isDarkMode } = useTheme();
  const { groups, expenses: allExpenses, refreshData, friends } = useData();
  const { user } = useAuth();
  const theme = isDarkMode ? COLORS.dark : COLORS.light;

  const [group, setGroup] = useState(null);
  const [balances, setBalances] = useState(null);
  const [settlements, setSettlements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showEditGroupModal, setShowEditGroupModal] = useState(false);
  const [showMembers, setShowMembers] = useState(false);

  // Find the group
  useEffect(() => {
    const foundGroup = groups.find(g => g.id === groupId);
    setGroup(foundGroup);
  }, [groups, groupId]);

  // Load group details
  const loadGroupDetails = async () => {
    try {
      const balanceData = await apiClient.getGroupBalances(groupId);
      setBalances(balanceData);
      
      // Try to fetch settlements, but don't fail if it errors
      try {
        const settlementsData = await apiClient.getGroupSettlements(groupId);
        setSettlements(settlementsData || []);
      } catch (settlementError) {
        setSettlements([]);
      }
    } catch (error) {
      // If token expired, show alert
      if (error.message && error.message.includes('credentials')) {
        Alert.alert(
          'Session Expired',
          'Your session has expired. Please logout and login again to continue.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGroupDetails();
  }, [groupId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    await loadGroupDetails();
    setRefreshing(false);
  };

  const handleSettleUp = () => {
    navigation.navigate('Settlement', { groupId });
  };

  const handleEditGroup = async (updatedGroup) => {
    try {
      await apiClient.updateGroup(groupId, {
        name: updatedGroup.name,
        currency: updatedGroup.currency,
        member_ids: updatedGroup.member_ids,
      });
      await loadGroupDetails();
      await refreshData();
      return { success: true };
    } catch (error) {
      throw error;
    }
  };

  const handleAddExpense = async (expenseData) => {
    try {
      await apiClient.createExpense({
        ...expenseData,
        group_id: groupId,
      });
      await refreshData();
      await loadGroupDetails();
    } catch (error) {
      throw error; // Let modal handle error display
    }
  };

  if (!group || isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
          Loading group details...
        </Text>
      </View>
    );
  }

  // Filter expenses for this group
  const groupExpenses = allExpenses.filter(exp => exp.group_id === groupId);

  // Combine expenses and settlements into transactions
  const transactions = [
    ...groupExpenses.map(exp => ({
      ...exp,
      type: 'expense',
      date: exp.expense_date || exp.date
    })),
    ...settlements.map(settlement => ({
      id: `settlement-${settlement.id}`,
      type: 'settlement',
      description: settlement.notes || 'Settlement',
      amount: settlement.amount,
      date: settlement.settlement_date,
      payer_id: settlement.payer_id,
      payee_id: settlement.payee_id,
      group_id: settlement.group_id
    }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  // Calculate totals from expenses
  const totalExpenses = groupExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  
  // Get current user's balance from the balance data
  const currentUserBalanceObj = balances?.balances?.find(b => b.user_id === user?.id);
  const currentUserBalance = currentUserBalanceObj?.balance || 0;
  const youOwe = currentUserBalance < 0 ? Math.abs(currentUserBalance) : 0;
  const youAreOwed = currentUserBalance > 0 ? currentUserBalance : 0;

  // Get members from balances (more accurate than group.members)
  const members = balances?.balances || group.members || [];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: theme.surfaceSecondary }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.backButtonText, { color: theme.text }]}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: theme.text }]} numberOfLines={1}>
            {group.name}
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
            {members.length} {members.length === 1 ? 'member' : 'members'} • {group.currency || 'USD'}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.editButton, { backgroundColor: theme.surfaceSecondary }]}
          onPress={() => setShowEditGroupModal(true)}
        >
          <Ionicons name="create-sharp" size={20} color={theme.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
      >
        {/* Balance Summary Rows */}
        <View style={[styles.balanceSummaryCard, { backgroundColor: theme.surface }, SHADOWS.medium]}>
          {/* Total Expenses Row */}
          <View style={styles.summaryRow}>
            <View style={styles.summaryRowLeft}>
              <Ionicons name="wallet-sharp" size={24} color={theme.textSecondary} style={styles.summaryRowIcon} />
              <Text style={[styles.summaryRowLabel, { color: theme.textSecondary }]}>Total Expenses</Text>
            </View>
            <Text style={[styles.summaryRowAmount, { color: theme.text }]}>
              {formatCurrency(totalExpenses, group.currency)}
            </Text>
          </View>

          <View style={[styles.summaryDivider, { backgroundColor: theme.border }]} />

          {/* You Owe Row */}
          <View style={styles.summaryRow}>
            <View style={styles.summaryRowLeft}>
              <Ionicons name="arrow-up-circle-sharp" size={24} color={COLORS.orange} style={styles.summaryRowIcon} />
              <Text style={[styles.summaryRowLabel, { color: theme.textSecondary }]}>You Owe</Text>
            </View>
            <Text style={[styles.summaryRowAmount, { color: COLORS.orange }]}>
              {formatCurrency(youOwe, group.currency)}
            </Text>
          </View>

          <View style={[styles.summaryDivider, { backgroundColor: theme.border }]} />

          {/* You Are Owed Row */}
          <View style={styles.summaryRow}>
            <View style={styles.summaryRowLeft}>
              <Ionicons name="arrow-down-circle-sharp" size={24} color={COLORS.primary} style={styles.summaryRowIcon} />
              <Text style={[styles.summaryRowLabel, { color: theme.textSecondary }]}>You Are Owed</Text>
            </View>
            <Text style={[styles.summaryRowAmount, { color: COLORS.primary }]}>
              {formatCurrency(youAreOwed, group.currency)}
            </Text>
          </View>

          <View style={[styles.summaryDivider, { backgroundColor: theme.border }]} />

          {/* Net Balance Row */}
          <View style={styles.summaryRow}>
            <View style={styles.summaryRowLeft}>
              <Ionicons 
                name={currentUserBalance === 0 ? 'checkmark-circle-sharp' : currentUserBalance > 0 ? 'trending-up-sharp' : 'trending-down-sharp'} 
                size={24} 
                color={currentUserBalance === 0 ? COLORS.success : currentUserBalance > 0 ? COLORS.primary : COLORS.orange} 
                style={styles.summaryRowIcon} 
              />
              <Text style={[styles.summaryRowLabel, { color: theme.textSecondary }]}>Your Net Balance</Text>
            </View>
            <Text style={[
              styles.summaryRowAmount, 
              { color: currentUserBalance >= 0 ? COLORS.primary : COLORS.orange, fontWeight: FONT_WEIGHTS.bold }
            ]}>
              {currentUserBalance >= 0 ? '+' : ''}{formatCurrency(currentUserBalance, group.currency)}
            </Text>
          </View>
        </View>

        {/* Group Members - Collapsible */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={[styles.membersHeader, { backgroundColor: theme.surface }, SHADOWS.small]}
            onPress={() => setShowMembers(!showMembers)}
            activeOpacity={0.7}
          >
            <View style={styles.membersHeaderLeft}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Group Members</Text>
              <View style={[styles.memberCount, { backgroundColor: COLORS.primary + '20' }]}>
                <Text style={[styles.memberCountText, { color: COLORS.primary }]}>
                  {members.length}
                </Text>
              </View>
            </View>
            <Text style={[styles.accordionIcon, { color: theme.textSecondary }]}>
              {showMembers ? '▼' : '▶'}
            </Text>
          </TouchableOpacity>
          
          {showMembers && (
            <View style={[styles.membersCard, { backgroundColor: theme.surface }, SHADOWS.small]}>
              {members.map((member, index) => (
                <View
                  key={member.user_id || index}
                  style={[
                    styles.memberRow,
                    index < members.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border }
                  ]}
                >
                  <View style={styles.memberInfo}>
                    <LinearGradient
                      colors={[COLORS.primary, COLORS.primaryDark]}
                      style={styles.memberAvatar}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Text style={styles.memberAvatarText}>
                        {(member.user_name || member.name || '?').charAt(0).toUpperCase()}
                      </Text>
                    </LinearGradient>
                    <View style={styles.memberDetails}>
                      <Text style={[styles.memberName, { color: theme.text }]}>
                        {member.user_name || member.name || 'Unknown'}
                        {member.user_id === user?.id && ' (You)'}
                      </Text>
                      {member.balance !== undefined && member.balance !== 0 && (
                        <Text style={[styles.memberBalance, { color: member.balance > 0 ? COLORS.primary : COLORS.orange }]}>
                          {member.balance > 0 ? 'is owed' : 'owes'} {formatCurrency(Math.abs(member.balance), group.currency)}
                        </Text>
                      )}
                      {member.balance === 0 && (
                        <Text style={[styles.memberBalance, { color: theme.textTertiary }]}>Settled up</Text>
                      )}
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Transactions List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Group Transactions</Text>
            <Text style={[styles.expenseCount, { color: theme.textSecondary }]}>
              {transactions.length} {transactions.length === 1 ? 'transaction' : 'transactions'}
            </Text>
          </View>

          {transactions.length > 0 ? (
            transactions.map((transaction) => {
              if (transaction.type === 'settlement') {
                return (
                  <SettlementCard
                    key={transaction.id}
                    settlement={transaction}
                    isDarkMode={isDarkMode}
                    currency={group.currency}
                    members={members}
                  />
                );
              } else {
                return (
                  <ExpenseCard
                    key={transaction.id}
                    expense={transaction}
                    isDarkMode={isDarkMode}
                    currency={group.currency}
                    onPress={() => {
                      // Navigate to expense details if needed
                    }}
                  />
                );
              }
            })
          ) : (
            <View style={[styles.emptyExpenses, { backgroundColor: theme.surface }]}>
              <Ionicons name="receipt-outline" size={48} color={theme.textTertiary} style={styles.emptyExpensesIcon} />
              <Text style={[styles.emptyExpensesText, { color: theme.textSecondary }]}>
                No transactions in this group yet
              </Text>
            </View>
          )}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Action Buttons */}
      <View style={[styles.actionButtons, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setShowAddExpenseModal(true)}
        >
          <LinearGradient
            colors={[COLORS.secondary, COLORS.secondaryDark]}
            style={styles.actionButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.actionButtonContent}>
              <Ionicons name="add-circle-sharp" size={20} color="#FFFFFF" style={styles.actionButtonIcon} />
              <Text style={styles.actionButtonText}>Add Expense</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {(youOwe > 0 || youAreOwed > 0) && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleSettleUp}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryDark]}
              style={styles.actionButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.actionButtonContent}>
                <Ionicons name="checkmark-done-sharp" size={20} color="#FFFFFF" style={styles.actionButtonIcon} />
                <Text style={styles.actionButtonText}>Settle Up</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>

      {/* Add Expense Modal */}
      <AddExpenseModal
        visible={showAddExpenseModal}
        onClose={() => setShowAddExpenseModal(false)}
        onSubmit={handleAddExpense}
        group={{
          ...group,
          members: members.map(m => ({
            id: m.user_id || m.id,
            user_id: m.user_id || m.id,
            name: m.user_name || m.name,
            user_name: m.user_name || m.name
          }))
        }}
        isDarkMode={isDarkMode}
      />

      {/* Edit Group Modal */}
      <EditGroupModal
        visible={showEditGroupModal}
        onClose={() => setShowEditGroupModal(false)}
        onSubmit={handleEditGroup}
        group={group}
        friends={friends}
        isDarkMode={isDarkMode}
      />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    ...SHADOWS.small,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  backButtonText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
  },
  headerCenter: {
    flex: 1,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.xs,
    marginTop: 2,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
  },
  balanceSummaryCard: {
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    padding: SPACING.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
  },
  summaryRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  summaryRowIcon: {
    marginRight: SPACING.sm,
  },
  summaryRowLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
  },
  summaryRowAmount: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    marginLeft: SPACING.sm,
    flexShrink: 0,
  },
  summaryDivider: {
    height: 1,
    marginVertical: SPACING.xs,
  },
  section: {
    marginBottom: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
  },
  expenseCount: {
    fontSize: FONT_SIZES.xs,
  },
  membersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.xs,
  },
  membersHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  memberCount: {
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    minWidth: 24,
    alignItems: 'center',
  },
  memberCountText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  accordionIcon: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
  },
  membersCard: {
    borderRadius: BORDER_RADIUS.sm,
    overflow: 'hidden',
    marginTop: SPACING.xs,
  },
  memberRow: {
    padding: SPACING.sm,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberAvatar: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  memberAvatarText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
    color: '#FFFFFF',
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  memberBalance: {
    fontSize: FONT_SIZES.xs,
    marginTop: 2,
  },
  emptyExpenses: {
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  emptyExpensesIcon: {
    marginBottom: SPACING.xs,
  },
  emptyExpensesText: {
    fontSize: FONT_SIZES.xs,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: SPACING.md,
    borderTopWidth: 1,
    gap: SPACING.sm,
    ...SHADOWS.medium,
  },
  actionButton: {
    flex: 1,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    height: 50,
  },
  actionButtonGradient: {
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.sm,
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  actionButtonIcon: {
    marginRight: SPACING.xs,
  },
  actionButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
    color: '#FFFFFF',
  },
  bottomSpacer: {
    height: SPACING.xl,
  },
});
