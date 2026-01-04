import { useState, useEffect } from 'react';
import { groupAPI, friendsAPI, expenseAPI, activityAPI } from '../api';

/**
 * Get emoji icon based on expense description
 */
const getExpenseIcon = (description) => {
  const lowerDesc = description.toLowerCase();
  if (lowerDesc.includes('dinner') || lowerDesc.includes('restaurant') || lowerDesc.includes('food')) return '🍽️';
  if (lowerDesc.includes('uber') || lowerDesc.includes('taxi') || lowerDesc.includes('transport')) return '🚗';
  if (lowerDesc.includes('grocery') || lowerDesc.includes('groceries')) return '🛒';
  if (lowerDesc.includes('movie') || lowerDesc.includes('cinema')) return '🎬';
  if (lowerDesc.includes('coffee') || lowerDesc.includes('cafe')) return '☕';
  if (lowerDesc.includes('rent')) return '🏠';
  if (lowerDesc.includes('electricity') || lowerDesc.includes('bill') || lowerDesc.includes('utility')) return '💡';
  if (lowerDesc.includes('flight') || lowerDesc.includes('ticket')) return '✈️';
  return '💰';
};

/**
 * Get member name by ID from groups
 */
const getMemberName = (userId, group) => {
  const member = group.members?.find(m => m.id === userId);
  return member ? member.name : 'Unknown';
};

/**
 * Custom hook for managing app data (groups, expenses, friends)
 */
export const useData = (user, currency) => {
  const [expenses, setExpenses] = useState([]);
  const [groups, setGroups] = useState([]);
  const [friends, setFriends] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load data when user is available
  useEffect(() => {
    if (user) {
      loadAllData();
    }
  }, [user]);

  /**
   * Load all data (groups, expenses, balances)
   */
  const loadAllData = async () => {
    try {
      setLoading(true);
      const loadedGroups = await loadGroups();
      await loadExpenses(loadedGroups);
    } catch (error) {
      setError('Failed to load data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load groups from API
   */
  const loadGroups = async () => {
    if (!user || !user.id) {
      console.error('[useData] Cannot load groups: user is not defined', user);
      return [];
    }
    
    try {
      const groupsData = await groupAPI.getGroups();

      // Load balances for each group
      const groupsWithBalances = await Promise.all(
        groupsData.map(async (group) => {
          try {
            const balanceData = await groupAPI.getGroupBalances(group.id);

            // Find current user's balance
            const userBalance = balanceData.balances?.find(
              b => b.user_id === user?.id
            );

            console.log(`[useData] Group ${group.id} (${group.name}):`, {
              balancesCount: balanceData.balances?.length,
              userBalance: userBalance,
              userId: user?.id
            });

            return {
              ...group,
              balance: userBalance?.balance || 0,
              balanceData: balanceData,
              // Use group's own currency, fallback to global currency
              currency: group.currency || currency,
            };
          } catch (error) {
            console.error(`[useData] Failed to load balance for group ${group.id}:`, error);
            return {
              ...group,
              balance: 0,
              // Use group's own currency, fallback to global currency
              currency: group.currency || currency,
            };
          }
        })
      );

      setGroups(groupsWithBalances);

      // Load friends from API
      try {
        const friendsData = await friendsAPI.getFriends();

        // Calculate balance with each friend across all groups
        const friendsWithBalances = friendsData.map(friend => {
          let totalBalance = 0;

          groupsWithBalances.forEach(group => {
            if (group.balanceData) {
              group.balanceData.balances.forEach(balance => {
                if (balance.user_id === friend.id) {
                  // NOTE: This is NOT true pairwise balance; it is based on the friend's net position in each group.
                  // Kept as-is to avoid changing product semantics in this refactor.
                  totalBalance -= balance.balance;
                }
              });
            }
          });

          return {
            id: friend.id,
            name: friend.name,
            email: friend.email,
            balance: totalBalance,
            status: 'joined'
          };
        });

        setFriends(friendsWithBalances);
      } catch (error) {
        setFriends([]);
      }

      // Load activity from API
      try {
        const activityData = await activityAPI.getActivity();
        setActivities(activityData || []);
      } catch (error) {
        setActivities([]);
      }

      // Return the loaded groups so they can be used immediately
      return groupsWithBalances;

    } catch (error) {
      throw error;
    }
  };

  /**
   * Load expenses from all groups
   * @param {Array} groupsToLoad - Optional array of groups to load expenses from (uses state if not provided)
   */
  const loadExpenses = async (groupsToLoad = null) => {
    try {
      const groupsArray = groupsToLoad || groups;
      if (!user || groupsArray.length === 0) {
        return;
      }

      const allExpenses = [];

      for (const group of groupsArray) {
        try {
          const groupExpenses = await groupAPI.getGroupExpenses(group.id);
          
          // Load expenses with split details
          const formattedExpenses = await Promise.all(groupExpenses.map(async expense => {
            const paidByCurrentUser = expense.paid_by_user_id === user.id;
            
            // Fetch splits for this expense
            let youOwe = 0;
            let youAreOwed = 0;
            let splits = [];
            
            try {
              const splitsData = await expenseAPI.getExpenseSplits(expense.id);
              splits = splitsData.splits || [];

              // Calculate youOwe and youAreOwed
              const userSplit = splits.find(s => s.user_id === user.id);
              const userSplitAmount = userSplit ? userSplit.amount : 0;

              if (paidByCurrentUser) {
                // User paid, so they are owed (amount - their share)
                youAreOwed = expense.amount - userSplitAmount;
              } else {
                // User didn't pay, so they owe their share
                youOwe = userSplitAmount;
              }
            } catch (error) {
              // Failed to load splits, continue without them
            }

            return {
              id: expense.id,
              description: expense.description,
              amount: expense.amount,
              paidBy: paidByCurrentUser ? 'You' : getMemberName(expense.paid_by_user_id, group),
              date: new Date(expense.expense_date).toISOString().split('T')[0],
              icon: getExpenseIcon(expense.description),
              group: group.name,
              groupId: group.id,
              groupCurrency: group.currency || currency, // Add group's currency
              paidByUserId: expense.paid_by_user_id,
              youOwe: youOwe,
              youAreOwed: youAreOwed,
              splits: splits, // Include splits for potential display
            };
          }));

          allExpenses.push(...formattedExpenses);
        } catch (error) {
          // Failed to load expenses for this group, continue with others
        }
      }

      // Sort by date (newest first)
      allExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));

      setExpenses(allExpenses);
    } catch (error) {
      throw error;
    }
  };

  return {
    expenses,
    groups,
    friends,
    activities,
    loading,
    error,
    loadAllData,
    setExpenses,
    setGroups,
    setFriends,
    setActivities
  };
};
