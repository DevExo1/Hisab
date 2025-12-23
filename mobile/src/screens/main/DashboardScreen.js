/**
 * Dashboard Screen
 * Main overview of balances and recent activity
 */

import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  RefreshControl, 
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Pressable
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import BalanceCard from '../../components/BalanceCard';
import ExpenseCard from '../../components/ExpenseCard';
import GroupCard from '../../components/GroupCard';

export default function DashboardScreen({ navigation }) {
  const { isDarkMode } = useTheme();
  const { user, logout } = useAuth();
  const { groups, expenses, isLoading, refreshData } = useData();
  const theme = isDarkMode ? COLORS.dark : COLORS.light;

  const [refreshing, setRefreshing] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  }, [refreshData]);

  // Calculate overall balance from groups
  const calculateOverallBalance = () => {
    if (!groups || groups.length === 0) return { youOwe: 0, youAreOwed: 0 };
    
    let totalOwed = 0;
    let totalOwing = 0;

    groups.forEach(group => {
      if (group.balance > 0) {
        totalOwed += group.balance;
      } else if (group.balance < 0) {
        totalOwing += Math.abs(group.balance);
      }
    });

    return {
      youOwe: totalOwing,
      youAreOwed: totalOwed,
    };
  };

  const overallBalance = calculateOverallBalance();
  const recentExpenses = expenses.slice(0, 5);
  const recentGroups = groups.slice(0, 3);

  // Show loading state on first load
  if (isLoading && !refreshing && groups.length === 0) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
          Loading your dashboard...
        </Text>
      </View>
    );
  }

  const handleLogout = async () => {
    setShowProfileMenu(false);
    await logout();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* App Header */}
      <View style={[styles.appHeader, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <View style={styles.headerLeft}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryDark]}
            style={styles.logoContainer}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.logoText}>₹</Text>
          </LinearGradient>
          <View>
            <Text style={[styles.appName, { color: theme.text }]}>Hisab</Text>
            <Text style={[styles.appTagline, { color: theme.textSecondary }]}>Group Accounts Manager</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => setShowProfileMenu(true)}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryDark]}
            style={styles.profileAvatar}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.profileInitial}>{user?.name?.charAt(0)?.toUpperCase() || '?'}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Profile Menu Modal */}
      <Modal
        visible={showProfileMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowProfileMenu(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowProfileMenu(false)}
        >
          <View style={[styles.profileMenu, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={[styles.profileMenuHeader, { borderBottomColor: theme.border }]}>
              <Text style={[styles.profileMenuName, { color: theme.text }]}>{user?.name || 'User'}</Text>
              <Text style={[styles.profileMenuEmail, { color: theme.textSecondary }]}>{user?.email || ''}</Text>
            </View>
            
            <TouchableOpacity
              style={styles.profileMenuItem}
              onPress={() => {
                setShowProfileMenu(false);
                navigation.navigate('Profile');
              }}
            >
              <Text style={styles.profileMenuIcon}>⚙️</Text>
              <Text style={[styles.profileMenuText, { color: theme.text }]}>Profile Settings</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.profileMenuItem, styles.logoutItem, { borderTopColor: theme.border }]}
              onPress={handleLogout}
            >
              <Text style={styles.profileMenuIcon}>🚪</Text>
              <Text style={[styles.profileMenuText, styles.logoutText]}>Logout</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      <ScrollView 
        style={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
      >
        <View style={styles.content}>
          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <Text style={[styles.greeting, { color: theme.textSecondary }]}>Welcome back,</Text>
            <Text style={[styles.userName, { color: theme.text }]}>{user?.name || 'User'}</Text>
          </View>

        {/* Balance Card */}
        <BalanceCard
          youOwe={overallBalance.youOwe}
          youAreOwed={overallBalance.youAreOwed}
          isDarkMode={isDarkMode}
          currency="USD"
        />

        {/* Hero Section */}
        <View style={[styles.heroCard, { backgroundColor: theme.surface }, SHADOWS.large]}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryDark]}
            style={styles.heroGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>Split expenses beautifully</Text>
              <Text style={styles.heroSubtitle}>Keep track of shared expenses and balances with friends</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Recent Groups Section */}
        {groups.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Your Groups</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Groups')}>
                <Text style={[styles.seeAllButton, { color: COLORS.primary }]}>View all →</Text>
              </TouchableOpacity>
            </View>
            
            {recentGroups.map(group => (
              <GroupCard
                key={group.id}
                group={group}
                isDarkMode={isDarkMode}
                currency="USD"
                onPress={() => navigation.navigate('GroupDetails', { groupId: group.id })}
              />
            ))}
          </View>
        )}

        {/* Recent Expenses Section */}
        {expenses.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Expenses</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Expenses')}>
                <Text style={[styles.seeAllButton, { color: COLORS.primary }]}>View all →</Text>
              </TouchableOpacity>
            </View>
            
            {recentExpenses.map(expense => (
              <ExpenseCard
                key={expense.id}
                expense={expense}
                isDarkMode={isDarkMode}
                currency="USD"
                onPress={() => {
                  // Navigate to expense details if needed
                }}
              />
            ))}
          </View>
        ) : (
          <View style={[styles.emptyState, { backgroundColor: theme.surface }]}>
            <Text style={styles.emptyStateEmoji}>💸</Text>
            <Text style={[styles.emptyStateTitle, { color: theme.text }]}>No expenses yet</Text>
            <Text style={[styles.emptyStateText, { color: theme.textSecondary }]}>
              Start by creating a group and adding expenses
            </Text>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={[styles.quickActionButton, { backgroundColor: COLORS.primary }, SHADOWS.medium]}
            onPress={() => navigation.navigate('Groups')}
          >
            <Text style={styles.quickActionEmoji}>👥</Text>
            <Text style={styles.quickActionText}>Create Group</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.quickActionButton, { backgroundColor: COLORS.secondary }, SHADOWS.medium]}
            onPress={() => navigation.navigate('Expenses')}
          >
            <Text style={styles.quickActionEmoji}>💰</Text>
            <Text style={styles.quickActionText}>Add Expense</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacer} />
      </View>
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  appHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    ...SHADOWS.small,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  logoText: {
    fontSize: 20,
    fontWeight: FONT_WEIGHTS.bold,
    color: '#FFFFFF',
  },
  appName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
  },
  appTagline: {
    fontSize: FONT_SIZES.xs,
    marginTop: -2,
  },
  profileButton: {
    padding: SPACING.xs,
  },
  profileAvatar: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 50,
    paddingRight: SPACING.md,
  },
  profileMenu: {
    width: 220,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    ...SHADOWS.large,
  },
  profileMenuHeader: {
    padding: SPACING.md,
    borderBottomWidth: 1,
  },
  profileMenuName: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    marginBottom: 2,
  },
  profileMenuEmail: {
    fontSize: FONT_SIZES.xs,
  },
  profileMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  profileMenuIcon: {
    fontSize: 18,
    marginRight: SPACING.sm,
  },
  profileMenuText: {
    fontSize: FONT_SIZES.sm,
  },
  logoutItem: {
    borderTopWidth: 1,
  },
  logoutText: {
    color: COLORS.error,
  },
  scrollContent: {
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
  content: {
    padding: SPACING.md,
  },
  welcomeSection: {
    marginBottom: SPACING.lg,
  },
  greeting: {
    fontSize: FONT_SIZES.sm,
    marginBottom: 2,
  },
  userName: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
  },
  heroCard: {
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  heroGradient: {
    padding: SPACING.md,
    minHeight: 80,
    justifyContent: 'center',
  },
  heroContent: {
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
    marginTop: SPACING.xs,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
  },
  seeAllButton: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  emptyState: {
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  emptyStateEmoji: {
    fontSize: 48,
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
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
    gap: SPACING.sm,
  },
  quickActionButton: {
    flex: 1,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  quickActionEmoji: {
    fontSize: 18,
    marginRight: SPACING.xs,
  },
  quickActionText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    color: '#FFFFFF',
  },
  bottomSpacer: {
    height: SPACING.lg,
  },
});
