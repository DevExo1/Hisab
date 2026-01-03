import React, { useState, useEffect } from 'react';
import { ActivityItem } from '../components/cards';
import { formatCurrency } from '../utils/currency';
import { groupAPI } from '../api';

export const GroupDetails = ({
  selectedGroupView,
  darkMode,
  currency,
  expenses,
  handleBackFromGroupDetails,
  handleEditGroupClick,
  handleAddExpenseToGroup,
  handleOpenSettlement,
  user,
  onExpenseAdded,
  handleRefreshAll
}) => {
  const [balanceData, setBalanceData] = useState(null);
  const [isLoadingBalances, setIsLoadingBalances] = useState(true);
  const [settlements, setSettlements] = useState([]);
  const [isLoadingSettlements, setIsLoadingSettlements] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (selectedGroupView) {
      fetchGroupBalances();
      fetchGroupSettlements();
    }
  }, [selectedGroupView?.id, onExpenseAdded, expenses]);

  const fetchGroupBalances = async () => {
    try {
      setIsLoadingBalances(true);
      const data = await groupAPI.getGroupBalances(selectedGroupView.id);
      setBalanceData(data);
    } catch (error) {

    } finally {
      setIsLoadingBalances(false);
    }
  };

  const fetchGroupSettlements = async () => {
    try {
      setIsLoadingSettlements(true);
      const data = await groupAPI.getGroupSettlements(selectedGroupView.id);
      setSettlements(data || []);
    } catch (error) {

      // Set empty array on error so UI still works
      setSettlements([]);
    } finally {
      setIsLoadingSettlements(false);
    }
  };

  const handleRefresh = async () => {
    await Promise.all([fetchGroupBalances(), fetchGroupSettlements()]);
    // Also trigger parent data refresh if callback provided
    if (handleRefreshAll) {
      await handleRefreshAll();
    }
  };

  const handleDeleteGroup = async () => {
    if (deleteConfirmText !== selectedGroupView.name) {
      alert('Group name does not match. Please type the exact group name to confirm deletion.');
      return;
    }

    setIsDeleting(true);
    try {
      const result = await groupAPI.deleteGroup(selectedGroupView.id);
      alert(`Group deleted successfully!\n\nDeleted:\n- ${result.deleted.expenses} expenses\n- ${result.deleted.settlements} settlements\n- ${result.deleted.members} members`);
      
      // Refresh all data and navigate back
      if (handleRefreshAll) {
        await handleRefreshAll();
      }
      handleBackFromGroupDetails();
    } catch (error) {
      console.error('Error deleting group:', error);
      if (error.response?.status === 403) {
        alert('You cannot delete this group. Only the group creator can delete it.');
      } else {
        alert('Failed to delete group. Please try again.');
      }
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setDeleteConfirmText('');
    }
  };

  if (!selectedGroupView) return null;

  const groupExpenses = expenses.filter(exp => exp.groupId === selectedGroupView.id);
  
  // Combine expenses and settlements into transactions formatted for ActivityItem
  const transactions = [
    ...groupExpenses.map(exp => {
      // Map splits to participants format expected by ActivityItem
      const participants = exp.splits?.map(split => ({
        user_id: split.user_id,
        user_name: selectedGroupView.members.find(m => m.id === split.user_id)?.name || 'Unknown',
        amount: split.amount
      })) || [];

      return {
        id: exp.id,
        type: 'expense',
        description: exp.description,
        amount: exp.amount,
        date: exp.date || exp.expense_date,
        paid_by_name: exp.paidBy, // Already formatted as "You" or member name
        paid_by_user_id: exp.paidByUserId,
        group_name: selectedGroupView.name,
        participant_count: exp.splits?.length || 0,
        participants: participants
      };
    }),
    ...settlements.map(settlement => {
      // Find payer and payee names
      const payer = selectedGroupView.members.find(m => m.id === settlement.payer_id);
      const payee = selectedGroupView.members.find(m => m.id === settlement.payee_id);
      return {
        id: `settlement-${settlement.id}`,
        type: 'settlement',
        amount: settlement.amount,
        date: settlement.settlement_date,
        payer_name: payer?.name || 'Unknown',
        payee_name: payee?.name || 'Unknown',
        payer_id: settlement.payer_id,
        payee_id: settlement.payee_id,
        group_name: selectedGroupView.name,
        notes: settlement.notes
      };
    })
  ].sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // Calculate totals
  const totalExpenses = groupExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  
  // Get current user's balance from the balance data
  const currentUserBalance = balanceData?.balances?.find(b => b.user_id === user?.id);
  const netBalance = currentUserBalance?.balance || 0;
  
  // Calculate "You Owe" and "You Are Owed" from net balance
  const youOwe = netBalance < 0 ? Math.abs(netBalance) : 0;
  const youAreOwed = netBalance > 0 ? netBalance : 0;

  return (
    <div className="space-y-6">
      {/* Header with back button and refresh */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={handleBackFromGroupDetails}
            className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
          >
            <span className="text-xl">←</span>
          </button>
          <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {selectedGroupView.name}
          </h2>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isLoadingBalances || isLoadingSettlements}
          className={`p-2 rounded-lg transition-all ${
            isLoadingBalances || isLoadingSettlements
              ? 'opacity-50 cursor-not-allowed'
              : darkMode 
                ? 'hover:bg-gray-700' 
                : 'hover:bg-gray-100'
          }`}
          title="Refresh group data"
        >
          <span className={`text-xl ${(isLoadingBalances || isLoadingSettlements) ? 'animate-spin inline-block' : ''}`}>
            🔄
          </span>
        </button>
      </div>

      {/* Balance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Expenses Card */}
        <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl border p-5 hover-lift`}>
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 ${darkMode ? 'bg-slate-700' : 'bg-blue-50'} rounded-xl flex items-center justify-center`}>
              <span className="text-2xl">💰</span>
            </div>
            <div>
              <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Total Expenses</p>
              <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                {formatCurrency(totalExpenses, selectedGroupView.currency || currency)}
              </p>
            </div>
          </div>
        </div>

        {/* You Owe Card */}
        <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl border p-5 hover-lift`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 ${darkMode ? 'bg-slate-700' : 'bg-red-50'} rounded-xl flex items-center justify-center`}>
                <span className="text-2xl">💸</span>
              </div>
              <div>
                <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>You Owe</p>
                {isLoadingBalances ? (
                  <p className={`text-xl font-bold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>...</p>
                ) : (
                  <p className={`text-xl font-bold text-gradient-coral`}>
                    {formatCurrency(youOwe, selectedGroupView.currency || currency)}
                  </p>
                )}
              </div>
            </div>
            {!isLoadingBalances && youOwe > 0 && (
              <button
                onClick={() => handleOpenSettlement(selectedGroupView)}
                className="px-4 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-lg font-medium hover:from-teal-600 hover:to-emerald-600 transition-all shadow-md text-sm"
              >
                Settle Up
              </button>
            )}
          </div>
        </div>

        {/* You Are Owed Card */}
        <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl border p-5 hover-lift`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 ${darkMode ? 'bg-slate-700' : 'bg-green-50'} rounded-xl flex items-center justify-center`}>
                <span className="text-2xl">💵</span>
              </div>
              <div>
                <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>You're Owed</p>
                {isLoadingBalances ? (
                  <p className={`text-xl font-bold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>...</p>
                ) : (
                  <p className={`text-xl font-bold text-gradient-teal`}>
                    {formatCurrency(youAreOwed, selectedGroupView.currency || currency)}
                  </p>
                )}
              </div>
            </div>
            {!isLoadingBalances && (youOwe > 0 || youAreOwed > 0) && (
              <button
                onClick={() => handleOpenSettlement(selectedGroupView)}
                className="px-4 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-lg font-medium hover:from-teal-600 hover:to-emerald-600 transition-all shadow-md text-sm"
              >
                Settle Up
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Net Balance Summary */}
      <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl border p-5`}>
        <div className="flex justify-between items-center">
          <div>
            <p className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Your Net Balance</p>
            <p className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-500'} mt-1`}>
              {isLoadingBalances ? 'Loading...' : netBalance > 0 ? 'You are owed overall' : netBalance < 0 ? 'You owe overall' : 'You are settled up'}
            </p>
          </div>
          {isLoadingBalances ? (
            <p className={`text-2xl font-bold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>...</p>
          ) : (
            <p className={`text-2xl font-bold ${netBalance > 0 ? 'text-gradient-teal' : netBalance < 0 ? 'text-gradient-coral' : darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              {netBalance > 0 ? '+' : ''}{formatCurrency(netBalance, selectedGroupView.currency || currency)}
            </p>
          )}
        </div>
      </div>

      {/* Group Info Card */}
      <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl border p-6`}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Group Details
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
              {selectedGroupView.members.length} members • {selectedGroupView.currency || currency}
            </p>
          </div>
          <button
            onClick={() => handleEditGroupClick(selectedGroupView)}
            className="bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <span>✏️</span>
            <span>Edit Group</span>
          </button>
        </div>

        {/* Members List */}
        <div>
          <h4 className={`text-sm font-semibold mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Members
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {selectedGroupView.members.map((member, idx) => (
              <div
                key={idx}
                className={`flex items-center space-x-2 p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${darkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                  <span className="text-sm font-semibold">{member.name?.charAt(0) || '?'}</span>
                </div>
                <span className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  {member.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transactions Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Group Transactions
          </h3>
          <button
            onClick={() => handleAddExpenseToGroup(selectedGroupView)}
            className="bg-green-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <span>+</span>
            <span>Add Expense</span>
          </button>
        </div>

        <div className="space-y-3">
          {isLoadingSettlements ? (
            <div className={`${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-600'} rounded-xl p-8 text-center border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <p className="text-lg">Loading transactions...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className={`${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-600'} rounded-xl p-8 text-center border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <p className="text-lg mb-2">No transactions in this group yet</p>
              <p className="text-sm opacity-75">Click "Add Expense" to create the first expense</p>
            </div>
          ) : (
            transactions.map(activity => (
              <ActivityItem
                key={activity.id}
                activity={activity}
                darkMode={darkMode}
                currency={selectedGroupView.currency || currency}
              />
            ))
          )}
        </div>
      </div>

      {/* Delete Group Section - Only show if user is creator */}
      {user && selectedGroupView.created_by === user.id && (
        <div className={`${darkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} rounded-xl border p-6`}>
          <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-red-400' : 'text-red-700'}`}>
            Danger Zone
          </h3>
          <p className={`text-sm mb-4 ${darkMode ? 'text-red-300' : 'text-red-600'}`}>
            Once you delete a group, there is no going back. All expenses, settlements, and transaction history will be permanently deleted.
          </p>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="bg-red-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            Delete Group
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto`}>
            <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Delete Group?
            </h2>
            
            <div className="mb-6 space-y-4">
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-red-900/30 border-red-800' : 'bg-red-50 border-red-200'} border`}>
                <p className={`font-semibold mb-2 ${darkMode ? 'text-red-400' : 'text-red-700'}`}>
                  ⚠️ This will permanently delete:
                </p>
                <ul className={`text-sm space-y-1 ${darkMode ? 'text-red-300' : 'text-red-600'}`}>
                  <li>• {groupExpenses.length} expense{groupExpenses.length !== 1 ? 's' : ''}</li>
                  <li>• {settlements.length} settlement{settlements.length !== 1 ? 's' : ''}</li>
                  <li>• All transaction history for {selectedGroupView.members.length} member{selectedGroupView.members.length !== 1 ? 's' : ''}</li>
                </ul>
              </div>

              {!isLoadingBalances && netBalance !== 0 && (
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-yellow-900/30 border-yellow-800' : 'bg-yellow-50 border-yellow-200'} border`}>
                  <p className={`font-semibold mb-1 ${darkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
                    💰 Current Balance:
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-yellow-300' : 'text-yellow-600'}`}>
                    {netBalance > 0 
                      ? `You are owed ${formatCurrency(netBalance, selectedGroupView.currency || currency)}`
                      : `You owe ${formatCurrency(Math.abs(netBalance), selectedGroupView.currency || currency)}`
                    }
                  </p>
                  <p className={`text-xs mt-2 ${darkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
                    ⚠️ Deleting will erase these balances
                  </p>
                </div>
              )}

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Type the group name to confirm: <span className="font-bold">{selectedGroupView.name}</span>
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="Enter group name"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-red-500`}
                  disabled={isDeleting}
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText('');
                }}
                disabled={isDeleting}
                className={`flex-1 py-3 px-4 rounded-lg border font-medium transition-colors ${
                  darkMode
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                } ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteGroup}
                disabled={isDeleting || deleteConfirmText !== selectedGroupView.name}
                className={`flex-1 py-3 px-4 bg-red-600 text-white rounded-lg font-medium transition-colors ${
                  isDeleting || deleteConfirmText !== selectedGroupView.name
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-red-700'
                }`}
              >
                {isDeleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
