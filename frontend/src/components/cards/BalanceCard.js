import React from 'react';
import { formatCurrency } from '../../utils/currency';

export const BalanceCard = ({ darkMode, currency, youOwe = 0, youAreOwed = 0 }) => {
  const totalBalance = youAreOwed - youOwe;

  return (
    <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'glass-card'} rounded-2xl border p-8 mb-6 shadow-xl hover-lift`}>
      <div className="text-center">
        <h2 className={`text-xl font-bold heading-font mb-6 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Your Balance</h2>
        <div className="flex justify-center gap-12">
          <div className="text-center balance-animate">
            <div className="text-3xl font-bold heading-font text-gradient-teal mb-1">{formatCurrency(youAreOwed, currency)}</div>
            <div className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>You are owed</div>
          </div>
          <div className="text-center balance-animate">
            <div className="text-3xl font-bold heading-font text-gradient-coral mb-1">{formatCurrency(youOwe, currency)}</div>
            <div className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>You owe</div>
          </div>
        </div>
        <div className={`mt-6 pt-6 border-t ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
          <div className={`text-2xl font-bold heading-font balance-animate ${totalBalance >= 0 ? 'text-gradient-teal' : 'text-gradient-coral'}`}>
            {formatCurrency(Math.abs(totalBalance), currency)}
          </div>
          <div className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            {totalBalance === 0 ? 'Settled up' : totalBalance > 0 ? 'Total you are owed' : 'Total you owe'}
          </div>
        </div>
      </div>
    </div>
  );
};
