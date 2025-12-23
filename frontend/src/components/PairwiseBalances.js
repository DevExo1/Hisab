import React, { useState } from 'react';
import { formatCurrency } from '../utils/currency';

export const PairwiseBalances = ({ 
  pairwiseData, 
  darkMode, 
  currency, 
  onSettleClick,
  user,
  unlockedPayments = new Set(),
  onUnlockPayment
}) => {
  const [expandedPairs, setExpandedPairs] = useState({});

  const toggleExpand = (pairIndex) => {
    setExpandedPairs(prev => ({
      ...prev,
      [pairIndex]: !prev[pairIndex]
    }));
  };

  if (!pairwiseData || pairwiseData.length === 0) {
    return (
      <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        <p>✅ All settled up! No outstanding debts.</p>
      </div>
    );
  }

  // Separate user's debts and others
  const userDebts = pairwiseData.filter(pair => pair.from_user_id === user?.id);
  const otherDebts = pairwiseData.filter(pair => pair.from_user_id !== user?.id);

  return (
    <div className="space-y-3">
      {/* User's debts section */}
      {userDebts.length > 0 && (
        <div className="mb-2">
          <p className={`text-sm font-semibold ${darkMode ? 'text-teal-400' : 'text-teal-600'} mb-3`}>
            💳 Your Debts ({userDebts.length}):
          </p>
        </div>
      )}
      
      {userDebts.map((pair, idx) => {
        const index = pairwiseData.indexOf(pair);
        return (
          <div
            key={`user-${pair.from_user_id}-${pair.to_user_id}`}
            className={`${
              darkMode ? 'bg-teal-900/20 border-teal-700' : 'bg-teal-50 border-teal-200'
            } rounded-xl border p-4 hover-lift`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">👤</span>
                  <span className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    {pair.from_user_name}
                  </span>
                  <span className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    owes
                  </span>
                  <span className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    {pair.to_user_name}
                  </span>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xl font-bold text-gradient-coral">
                    {formatCurrency(pair.total_amount, currency)}
                  </span>
                  {pair.breakdown && (
                    <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      (net)
                    </span>
                  )}
                  <button
                    onClick={() => toggleExpand(index)}
                    className={`text-xs px-2 py-1 rounded ${
                      darkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    } transition-colors`}
                  >
                    {expandedPairs[index] ? 'Hide' : 'Show'} Details ({pair.expenses.length} expense{pair.expenses.length > 1 ? 's' : ''})
                  </button>
                </div>
              </div>
              <button
                onClick={() => onSettleClick(pair, index)}
                className="ml-4 px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-lg font-medium hover:from-teal-600 hover:to-emerald-600 transition-all shadow-md"
              >
                Settle Up
              </button>
            </div>

          {/* Expense breakdown */}
          {expandedPairs[index] && (
            <div className={`mt-4 pt-4 border-t ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
              {/* Net balance calculation */}
              {pair.breakdown && (
                <div className={`mb-4 p-3 rounded-lg ${darkMode ? 'bg-slate-700/50' : 'bg-blue-50'}`}>
                  <p className={`text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    💡 Net Balance Calculation:
                  </p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>
                        {pair.from_user_name} owes {pair.to_user_name}:
                      </span>
                      <span className={`font-medium ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                        {formatCurrency(pair.breakdown.owes, currency)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>
                        {pair.to_user_name} owes {pair.from_user_name}:
                      </span>
                      <span className={`font-medium ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                        {formatCurrency(pair.breakdown.owed_back, currency)}
                      </span>
                    </div>
                    <div className={`pt-2 mt-2 border-t flex justify-between ${darkMode ? 'border-slate-600' : 'border-slate-300'}`}>
                      <span className={`font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                        Net Balance:
                      </span>
                      <span className="font-bold text-gradient-coral">
                        {formatCurrency(pair.total_amount, currency)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              <p className={`text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                From These Expenses:
              </p>
              <div className="space-y-2">
                {pair.expenses.map((expense, expIndex) => (
                  <div
                    key={expIndex}
                    className={`flex justify-between items-center text-sm p-2 rounded ${
                      darkMode ? 'bg-slate-700/50' : 'bg-slate-50'
                    }`}
                  >
                    <div>
                      <span className={darkMode ? 'text-slate-200' : 'text-slate-800'}>
                        {expense.description}
                      </span>
                      <span className={`ml-2 text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {new Date(expense.date).toLocaleDateString()}
                      </span>
                    </div>
                    <span className={`font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      {formatCurrency(expense.amount, currency)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          </div>
        );
      })}
      
      {/* Other users' debts section */}
      {otherDebts.length > 0 && (
        <div className="mt-6 mb-2">
          <p className={`text-sm font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-600'} mb-3`}>
            👥 Other Payments ({otherDebts.length}):
          </p>
        </div>
      )}
      
      {otherDebts.map((pair, idx) => {
        const index = pairwiseData.indexOf(pair);
        const paymentKey = `${pair.from_user_id}-${pair.to_user_id}-${index}`;
        const isUnlocked = unlockedPayments.has(paymentKey);
        const isLocked = !isUnlocked;
        
        return (
          <div
            key={`other-${pair.from_user_id}-${pair.to_user_id}`}
            className={`${
              darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
            } rounded-xl border p-4 hover-lift relative ${isLocked ? 'opacity-60' : ''}`}
          >
            {isLocked && (
              <div className="absolute top-2 right-2">
                <span className="text-lg">🔒</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    {pair.from_user_name}
                  </span>
                  <span className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    owes
                  </span>
                  <span className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    {pair.to_user_name}
                  </span>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xl font-bold text-gradient-coral">
                    {formatCurrency(pair.total_amount, currency)}
                  </span>
                  {pair.breakdown && (
                    <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      (net)
                    </span>
                  )}
                  {!isLocked && (
                    <button
                      onClick={() => toggleExpand(index)}
                      className={`text-xs px-2 py-1 rounded ${
                        darkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      } transition-colors`}
                    >
                      {expandedPairs[index] ? 'Hide' : 'Show'} Details ({pair.expenses.length} expense{pair.expenses.length > 1 ? 's' : ''})
                    </button>
                  )}
                </div>
              </div>
              {isLocked ? (
                <button
                  onClick={() => onUnlockPayment(pair, index)}
                  className={`ml-4 px-4 py-2 rounded-lg font-medium transition-all ${
                    darkMode 
                      ? 'bg-slate-600 text-slate-300 hover:bg-slate-500' 
                      : 'bg-slate-300 text-slate-700 hover:bg-slate-400'
                  }`}
                >
                  🔓 Unlock to Settle
                </button>
              ) : (
                <button
                  onClick={() => onSettleClick(pair, index)}
                  className="ml-4 px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-lg font-medium hover:from-teal-600 hover:to-emerald-600 transition-all shadow-md"
                >
                  Settle Up
                </button>
              )}
            </div>

            {/* Expense breakdown - only show if unlocked */}
            {!isLocked && expandedPairs[index] && (
              <div className={`mt-4 pt-4 border-t ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                {/* Net balance calculation */}
                {pair.breakdown && (
                  <div className={`mb-4 p-3 rounded-lg ${darkMode ? 'bg-slate-700/50' : 'bg-blue-50'}`}>
                    <p className={`text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      💡 Net Balance Calculation:
                    </p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>
                          {pair.from_user_name} owes {pair.to_user_name}:
                        </span>
                        <span className={`font-medium ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                          {formatCurrency(pair.breakdown.owes, currency)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>
                          {pair.to_user_name} owes {pair.from_user_name}:
                        </span>
                        <span className={`font-medium ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                          {formatCurrency(pair.breakdown.owed_back, currency)}
                        </span>
                      </div>
                      <div className={`pt-2 mt-2 border-t flex justify-between ${darkMode ? 'border-slate-600' : 'border-slate-300'}`}>
                        <span className={`font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                          Net Balance:
                        </span>
                        <span className="font-bold text-gradient-coral">
                          {formatCurrency(pair.total_amount, currency)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                
                <p className={`text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  From These Expenses:
                </p>
                <div className="space-y-2">
                  {pair.expenses.map((expense, expIndex) => (
                    <div
                      key={expIndex}
                      className={`flex justify-between items-center text-sm p-2 rounded ${
                        darkMode ? 'bg-slate-700/50' : 'bg-slate-50'
                      }`}
                    >
                      <div>
                        <span className={darkMode ? 'text-slate-200' : 'text-slate-800'}>
                          {expense.description}
                        </span>
                        <span className={`ml-2 text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          {new Date(expense.date).toLocaleDateString()}
                        </span>
                      </div>
                      <span className={`font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        {formatCurrency(expense.amount, currency)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
