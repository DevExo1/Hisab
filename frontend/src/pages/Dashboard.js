import React from 'react';
import { BalanceCard, ExpenseCard } from '../components/cards';
import { calculateOverallBalance } from '../api';

export const Dashboard = ({
  darkMode,
  currency,
  groups,
  expenses,
  setShowLogin,
  setActiveTab
}) => {
  const overallBalance = calculateOverallBalance(groups);

  return (
    <div className="space-y-6">
      <BalanceCard
        darkMode={darkMode}
        currency={currency}
        youOwe={overallBalance.youOwe}
        youAreOwed={overallBalance.youAreOwed}
      />

      {/* Hero Section */}
      <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'glass-card'} rounded-2xl border overflow-hidden shadow-xl`}>
        <div className="relative h-48 gradient-teal">
          <img
            src="https://images.unsplash.com/photo-1593079323074-f1d77349c998"
            alt="Expense sharing concept"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white px-4">
              <h2 className="text-3xl font-bold heading-font mb-3">Split expenses beautifully</h2>
              <p className="text-lg opacity-95 font-medium">Keep track of shared expenses and balances with friends</p>
            </div>
          </div>
        </div>
      </div>

      {/* How Friends Login Info */}
      <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-sky-50 border-sky-200'} rounded-2xl border p-6 shadow-lg hover-lift`}>
        <h3 className={`font-bold text-lg heading-font mb-3 ${darkMode ? 'text-sky-200' : 'text-sky-800'}`}>
          🤝 How Friends Join EmergentSplit
        </h3>
        <div className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'} space-y-2.5`}>
          <p><strong>1. Invitation:</strong> When you add a friend, they receive an email invitation</p>
          <p><strong>2. Account Creation:</strong> They click the link and create their Splitwise account</p>
          <p><strong>3. Instant Access:</strong> Once joined, they can see shared expenses and add their own</p>
          <p><strong>4. Real-time Sync:</strong> All balances and expenses sync automatically across accounts</p>
        </div>
        <button
          onClick={() => setShowLogin(true)}
          className="mt-4 px-5 py-2.5 gradient-teal text-white rounded-xl text-sm font-semibold heading-font shadow-md hover:shadow-lg transition-all hover:scale-105"
        >
          See Login Experience
        </button>
      </div>

      {/* Recent Expenses */}
      <div>
        <div className="flex justify-between items-center mb-5">
          <h2 className={`text-2xl font-bold heading-font ${darkMode ? 'text-white' : 'text-slate-900'}`}>Recent Expenses</h2>
          <button
            onClick={() => setActiveTab('expenses')}
            className="text-gradient-teal hover:opacity-80 font-semibold text-sm transition-opacity"
          >
            View all →
          </button>
        </div>
        <div className="space-y-3">
          {expenses.slice(0, 3).map(expense => (
            <ExpenseCard key={expense.id} expense={expense} darkMode={darkMode} currency={currency} />
          ))}
        </div>
      </div>
    </div>
  );
};
