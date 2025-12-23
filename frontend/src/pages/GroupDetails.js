import React, { useState, useEffect } from 'react';
import { ExpenseCard, SettlementCard } from '../components/cards';
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
  user
}) => {
  const [balanceData, setBalanceData] = useState(null);
  const [isLoadingBalances, setIsLoadingBalances] = useState(true);
  const [settlements, setSettlements] = useState([]);
  const [isLoadingSettlements, setIsLoadingSettlements] = useState(true);

  useEffect(() => {
    if (selectedGroupView) {
      fetchGroupBalances();
      fetchGroupSettlements();
    }
  }, [selectedGroupView?.id]);

  const fetchGroupBalances = async () => {
    try {
      setIsLoadingBalances(true);
      const data = await groupAPI.getGroupBalances(selectedGroupView.id);
      setBalanceData(data);
    } catch (error) {
      console.error('Failed to load balances:', error);
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
      console.error('Failed to load settlements:', error);
      // Set empty array on error so UI still works
      setSettlements([]);
    } finally {
      setIsLoadingSettlements(false);
    }
  };

  if (!selectedGroupView) return null;

  const groupExpenses = expenses.filter(exp => exp.groupId === selectedGroupView.id);
  
  // Combine expenses and settlements into transactions
  const transactions = [
    ...groupExpenses.map(exp => ({
      ...exp,
      type: 'expense',
      date: exp.date || exp.expense_date
    })),
    ...settlements.map(settlement => ({
      id: `settlement-${settlement.id}`,
      type: 'settlement',
      description: settlement.notes || 'Settlement',
      amount: settlement.amount,
      date: settlement.settlement_date,
      payer_id: settlement.payer_id,
      payee_id: settlement.payee_id,
      groupId: settlement.group_id
    }))
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
      {/* Header with back button */}
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
                className="px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-lg font-medium hover:from-teal-600 hover:to-emerald-600 transition-all shadow-md text-sm"
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
                className="px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-lg font-medium hover:from-teal-600 hover:to-emerald-600 transition-all shadow-md text-sm"
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
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
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
            className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
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
            transactions.map(transaction => {
              if (transaction.type === 'settlement') {
                return (
                  <SettlementCard 
                    key={transaction.id} 
                    settlement={transaction} 
                    darkMode={darkMode} 
                    currency={selectedGroupView.currency || currency}
                    members={selectedGroupView.members}
                  />
                );
              } else {
                return (
                  <ExpenseCard 
                    key={transaction.id} 
                    expense={transaction} 
                    darkMode={darkMode} 
                    currency={currency} 
                  />
                );
              }
            })
          )}
        </div>
      </div>
    </div>
  );
};
