/**
 * Group Details Screen
 * Shows group balance, members, and expenses
 */

import React, { useState, useEffect, useCallback } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { formatCurrency } from '../../utils/currency';
import ActivityItem from '../../components/ActivityItem';
import AddExpenseModal from '../../components/AddExpenseModal';
import EditGroupModal from '../../components/EditGroupModal';
import SelectMembersModal from '../../components/SelectMembersModal';
import SyncStatusIndicator from '../../components/SyncStatusIndicator';
import apiClient from '../../api/client';

export default function GroupDetailsScreen({ route, navigation }) {
  const { groupId } = route.params;
  const { isDarkMode } = useTheme();
  const { groups, expenses: allExpenses, refreshData, friends } = useData();
  const { user } = useAuth();
  const theme = isDarkMode ? COLORS.dark : COLORS.light;
  const insets = useSafeAreaInsets();

  const [group, setGroup] = useState(null);
  const [balances, setBalances] = useState(null);
  const [settlements, setSettlements] = useState([]);
  const [expensesWithSplits, setExpensesWithSplits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showEditGroupModal, setShowEditGroupModal] = useState(false);
  const [showSelectMembersModal, setShowSelectMembersModal] = useState(false);
  const [editGroupMembers, setEditGroupMembers] = useState([]);
  const [editGroupFormState, setEditGroupFormState] = useState({
    groupName: '',
    currency: 'USD',
  });
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
      
      // Fetch splits for all group expenses
      const groupExpenses = allExpenses.filter(exp => exp.group_id === groupId);
      const expensesWithSplits = await Promise.all(
        groupExpenses.map(async (expense) => {
          try {
            const splitsData = await apiClient.getExpenseSplits(expense.id);
            return {
              ...expense,
              splits: splitsData.splits || []
            };
          } catch (error) {
            // If splits fetch fails, return expense without splits
            return { ...expense, splits: [] };
          }
        })
      );
      
      // Update the expenses in context with splits data
      setExpensesWithSplits(expensesWithSplits);
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

  // Reload local data when context data changes (e.g., after sync button press)
  useEffect(() => {
    // Only reload if we already have initial data (not on first load)
    if (!isLoading && group) {
      loadGroupDetails();
    }
  }, [allExpenses, groups]);

  // Refresh data when screen comes back into focus (e.g., after recording settlement)
  useFocusEffect(
    useCallback(() => {
      loadGroupDetails();
    }, [groupId])
  );

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
      // Only check if members are being REMOVED (not added), excluding current user
      const currentMemberIds = (group.members?.map(m => m.user_id || m.id) || []).filter(id => id !== user?.id);
      const newMemberIds = (updatedGroup.member_ids || []).filter(id => id !== user?.id);
      const removedMemberIds = currentMemberIds.filter(id => !newMemberIds.includes(id));
      
      // Only prevent removal if actual members (not current user) are being removed and there are transactions
      if (removedMemberIds.length > 0) {
        // Check if group has any transactions
        if (groupExpenses.length > 0 || settlements.length > 0) {
          throw new Error('Cannot remove members from a group with existing transactions. Members can only be added.');
        }
      }
      
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

  const handleDeleteGroup = () => {
    // Check if user is creator
    if (group.created_by !== user?.id) {
      Alert.alert(
        'Cannot Delete',
        'Only the group creator can delete this group.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Show balance warning if there are unsettled balances
    const balanceWarning = currentUserBalance !== 0
      ? `\n\n⚠️ Current balance: ${currentUserBalance > 0 ? '+' : ''}${formatCurrency(currentUserBalance, group.currency)}\nDeleting will erase this balance.`
      : '';

    Alert.alert(
      'Delete Group?',
      `This will permanently delete:\n\n• ${groupExpenses.length} expense${groupExpenses.length !== 1 ? 's' : ''}\n• ${settlements.length} settlement${settlements.length !== 1 ? 's' : ''}\n• All transaction history for ${members.length} member${members.length !== 1 ? 's' : ''}${balanceWarning}\n\nThis cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await apiClient.deleteGroup(groupId);
              await refreshData();
              Alert.alert(
                'Group Deleted',
                `Successfully deleted ${result.deleted.expenses} expenses, ${result.deleted.settlements} settlements, and removed ${result.deleted.members} members.`,
                [{ text: 'OK', onPress: () => navigation.goBack() }]
              );
            } catch (error) {
              Alert.alert(
                'Delete Failed',
                error.message || 'Failed to delete group. Please try again.',
                [{ text: 'OK' }]
              );
            }
          },
        },
      ]
    );
  };


  const handleOpenSelectMembersForEdit = (formState) => {
    // Save the current edit form state before switching modals
    setEditGroupFormState(formState);
    // Hide EditGroup and show SelectMembers
    setShowEditGroupModal(false);
    setShowSelectMembersModal(true);
  };

  const handleEditMembersSelected = (members) => {
    setEditGroupMembers(members);
    // Close SelectMembers and reopen EditGroup
    setShowSelectMembersModal(false);
    setShowEditGroupModal(true);
  };

  const handleCloseSelectMembersForEdit = () => {
    // Just go back to EditGroup without changing selections
    setShowSelectMembersModal(false);
    setShowEditGroupModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditGroupModal(false);
    setEditGroupMembers([]);
    setEditGroupFormState({ groupName: '', currency: 'USD' });
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

  // Use expenses with splits data if available, otherwise fall back to allExpenses
  const groupExpenses = expensesWithSplits.length > 0
    ? expensesWithSplits
    : allExpenses.filter(exp => exp.group_id === groupId);

  // Combine expenses and settlements into transactions formatted for display
  const transactions = [
    ...groupExpenses.map(exp => {
      // Find the payer name from group members
      const payer = group.members?.find(m => m.id === exp.paid_by_user_id) ||
                    members.find(m => m.user_id === exp.paid_by_user_id);
      const payerName = payer ? (payer.user_name || payer.name) :
                       (exp.paid_by_user_id === user?.id ? 'You' : 'Unknown');
      
      // Map splits to participants format
      const participants = exp.splits?.map(split => {
        const member = group.members?.find(m => m.id === split.user_id) ||
                      members.find(m => m.user_id === split.user_id);
        return {
          user_id: split.user_id,
          user_name: member ? (member.user_name || member.name) : 'Unknown',
          amount: split.amount
        };
      }) || [];

      return {
        ...exp,
        type: 'expense',
        date: exp.expense_date || exp.date,
        paid_by_name: payerName,
        group_name: group.name,
        participant_count: exp.splits?.length || 0,
        participants: participants
      };
    }),
    ...settlements.map(settlement => {
      // Find payer and payee names
      const payer = group.members?.find(m => m.id === settlement.payer_id) ||
                   members.find(m => m.user_id === settlement.payer_id);
      const payee = group.members?.find(m => m.id === settlement.payee_id) ||
                   members.find(m => m.user_id === settlement.payee_id);
      
      return {
        id: `settlement-${settlement.id}`,
        type: 'settlement',
        description: settlement.notes || 'Settlement',
        amount: settlement.amount,
        date: settlement.settlement_date,
        payer_id: settlement.payer_id,
        payee_id: settlement.payee_id,
        payer_name: payer ? (payer.user_name || payer.name) : 'Unknown',
        payee_name: payee ? (payee.user_name || payee.name) : 'Unknown',
        group_name: group.name,
        group_id: settlement.group_id,
        notes: settlement.notes
      };
    })
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

  // Show loading state if group not loaded
  if (!group) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: SPACING.xxl }} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: theme.text }]} numberOfLines={1}>
            {group.name}
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
            {members.length} {members.length === 1 ? 'member' : 'members'} • {group.currency || 'USD'}
          </Text>
        </View>
        <View style={styles.headerButtons}>
          <SyncStatusIndicator isDarkMode={isDarkMode} />
          <TouchableOpacity
            style={[styles.editButton, { backgroundColor: theme.surfaceSecondary }]}
            onPress={() => {
              if (!group) return;
              
              // Initialize edit group members from group data
              const memberIds = group.members
                ?.filter(m => !m.is_current_user)
                .map(m => m.user_id || m.id) || [];
              const preselected = friends ? friends.filter(f => memberIds.includes(f.id)) : [];
              setEditGroupMembers(preselected);
              
              // Initialize form state
              setEditGroupFormState({
                groupName: group.name || '',
                currency: group.currency || 'USD',
              });
              
              setShowEditGroupModal(true);
            }}
          >
            <Ionicons name="create-sharp" size={20} color={theme.text} />
          </TouchableOpacity>
        </View>
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
            transactions.map((transaction) => (
              <ActivityItem
                key={transaction.id}
                activity={transaction}
                theme={theme}
                isDarkMode={isDarkMode}
                currency={group.currency || 'USD'}
              />
            ))
          ) : (
            <View style={[styles.emptyExpenses, { backgroundColor: theme.surface }]}>
              <Ionicons name="receipt-outline" size={48} color={theme.textTertiary} style={styles.emptyExpensesIcon} />
              <Text style={[styles.emptyExpensesText, { color: theme.textSecondary }]}>
                No transactions in this group yet
              </Text>
            </View>
          )}
        </View>

        {/* Delete Group Section - Only show if user is creator */}
        {user && group.created_by === user.id && (
          <View style={[styles.dangerZone, { backgroundColor: theme.surfaceSecondary, borderColor: COLORS.orange }]}>
            <View style={styles.dangerZoneHeader}>
              <Ionicons name="warning-sharp" size={20} color={COLORS.orange} style={{ marginRight: SPACING.xs }} />
              <Text style={[styles.dangerZoneTitle, { color: COLORS.orange }]}>Danger Zone</Text>
            </View>
            <Text style={[styles.dangerZoneText, { color: theme.textSecondary }]}>
              Once you delete a group, there is no going back. All expenses, settlements, and transaction history will be permanently deleted.
            </Text>
            <TouchableOpacity
              style={[styles.deleteButton, { backgroundColor: COLORS.orange }]}
              onPress={handleDeleteGroup}
            >
              <Ionicons name="trash-sharp" size={18} color="#FFFFFF" style={{ marginRight: SPACING.xs }} />
              <Text style={styles.deleteButtonText}>Delete Group</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Action Buttons */}
      <View style={[styles.actionButtons, { backgroundColor: theme.surface, borderTopColor: theme.border, paddingBottom: insets.bottom }]}>
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
        onClose={async () => {
          setShowAddExpenseModal(false);
          // Reload data when modal closes - refresh context first, then load details
          await refreshData();
          await loadGroupDetails();
        }}
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
        onClose={handleCloseEditModal}
        onSubmit={handleEditGroup}
        group={group}
        friends={friends}
        isDarkMode={isDarkMode}
        selectedMembers={editGroupMembers}
        onOpenSelectMembers={handleOpenSelectMembersForEdit}
        initialFormState={editGroupFormState}
      />

      {/* Select Members Modal */}
      <SelectMembersModal
        visible={showSelectMembersModal}
        onClose={handleCloseSelectMembersForEdit}
        onDone={handleEditMembersSelected}
        friends={friends}
        initialSelectedFriends={editGroupMembers}
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
    paddingVertical: SPACING.xs,
    borderBottomWidth: 1,
    ...SHADOWS.small,
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
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinning: {
    transform: [{ rotate: '180deg' }],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.xs,
    paddingBottom: SPACING.md,
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
  },
  actionButtonGradient: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
  dangerZone: {
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    padding: SPACING.md,
    marginTop: SPACING.md,
  },
  dangerZoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  dangerZoneTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
  },
  dangerZoneText: {
    fontSize: FONT_SIZES.sm,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  deleteButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
    color: '#FFFFFF',
  },
});
