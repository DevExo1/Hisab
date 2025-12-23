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
import { useTheme } from '../../contexts/ThemeContext';
import { useData } from '../../contexts/DataContext';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { formatCurrency } from '../../utils/currency';
import ExpenseCard from '../../components/ExpenseCard';
import AddExpenseModal from '../../components/AddExpenseModal';
import apiClient from '../../api/client';

export default function GroupDetailsScreen({ route, navigation }) {
  const { groupId } = route.params;
  const { isDarkMode } = useTheme();
  const { groups, expenses: allExpenses, refreshData } = useData();
  const theme = isDarkMode ? COLORS.dark : COLORS.light;

  const [group, setGroup] = useState(null);
  const [balances, setBalances] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);

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
    } catch (error) {
      console.error('Failed to load group details:', error);
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

  // Calculate totals
  const totalExpenses = balances?.total_expenses || 0;
  const currentUserBalance = balances?.balances?.find(b => b.is_current_user)?.balance || 0;
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
          onPress={() => navigation.navigate('Groups', { openEdit: groupId })}
        >
          <Text style={[styles.editButtonText, { color: theme.text }]}>✏️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
      >
        {/* Balance Summary Cards */}
        <View style={styles.balanceSummary}>
          {/* Total Expenses */}
          <View style={[styles.summaryCard, { backgroundColor: theme.surface }, SHADOWS.medium]}>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Total Expenses</Text>
            <Text style={[styles.summaryAmount, { color: theme.text }]}>
              {formatCurrency(totalExpenses, group.currency)}
            </Text>
          </View>

          {/* You Owe */}
          <View style={[styles.summaryCard, { backgroundColor: theme.surface }, SHADOWS.medium]}>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>You Owe</Text>
            <Text style={[styles.summaryAmount, { color: COLORS.orange }]}>
              {formatCurrency(youOwe, group.currency)}
            </Text>
          </View>

          {/* You Are Owed */}
          <View style={[styles.summaryCard, { backgroundColor: theme.surface }, SHADOWS.medium]}>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>You Are Owed</Text>
            <Text style={[styles.summaryAmount, { color: COLORS.primary }]}>
              {formatCurrency(youAreOwed, group.currency)}
            </Text>
          </View>
        </View>

        {/* Net Balance Card */}
        <View style={[styles.netBalanceCard, { backgroundColor: theme.surface }, SHADOWS.large]}>
          <LinearGradient
            colors={currentUserBalance >= 0 ? [COLORS.primary, COLORS.primaryDark] : [COLORS.orange, '#F59E0B']}
            style={styles.netBalanceGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.netBalanceLabel}>Your Net Balance</Text>
            <Text style={styles.netBalanceAmount}>
              {currentUserBalance >= 0 ? '+' : ''}{formatCurrency(currentUserBalance, group.currency)}
            </Text>
            <Text style={styles.netBalanceText}>
              {currentUserBalance === 0 ? 'Settled up' : currentUserBalance > 0 ? 'You are owed' : 'You owe'}
            </Text>
          </LinearGradient>
        </View>

        {/* Group Members */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Group Members</Text>
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
                      {member.is_current_user && ' (You)'}
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
        </View>

        {/* Expenses List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Group Expenses</Text>
            <Text style={[styles.expenseCount, { color: theme.textSecondary }]}>
              {groupExpenses.length} {groupExpenses.length === 1 ? 'expense' : 'expenses'}
            </Text>
          </View>

          {groupExpenses.length > 0 ? (
            groupExpenses.map((expense) => (
              <ExpenseCard
                key={expense.id}
                expense={expense}
                isDarkMode={isDarkMode}
                currency={group.currency}
                onPress={() => {
                  // Navigate to expense details if needed
                }}
              />
            ))
          ) : (
            <View style={[styles.emptyExpenses, { backgroundColor: theme.surface }]}>
              <Text style={styles.emptyExpensesEmoji}>💸</Text>
              <Text style={[styles.emptyExpensesText, { color: theme.textSecondary }]}>
                No expenses in this group yet
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
            <Text style={styles.actionButtonText}>➕ Add Expense</Text>
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
              <Text style={styles.actionButtonText}>💰 Settle Up</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>

      {/* Add Expense Modal */}
      <AddExpenseModal
        visible={showAddExpenseModal}
        onClose={() => setShowAddExpenseModal(false)}
        onSubmit={handleAddExpense}
        group={group}
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
  editButtonText: {
    fontSize: FONT_SIZES.lg,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
  },
  balanceSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
    gap: SPACING.xs,
  },
  summaryCard: {
    flex: 1,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.sm,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.medium,
    marginBottom: 4,
    textAlign: 'center',
  },
  summaryAmount: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
  },
  netBalanceCard: {
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  netBalanceGradient: {
    padding: SPACING.md,
    alignItems: 'center',
  },
  netBalanceLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.medium,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 4,
  },
  netBalanceAmount: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  netBalanceText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: '#FFFFFF',
    opacity: 0.95,
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
  membersCard: {
    borderRadius: BORDER_RADIUS.sm,
    overflow: 'hidden',
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
  emptyExpensesEmoji: {
    fontSize: 40,
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
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
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
