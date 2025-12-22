import React from 'react';
import { formatCurrency } from '../../utils/currency';

export const ExpenseCard = ({ expense, darkMode, currency }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  // Use expense's currency if available, otherwise fall back to default currency
  const expenseCurrency = expense.currency || currency;

  return (
    <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl border p-5 mb-3 hover-lift card-entrance`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`w-12 h-12 ${darkMode ? 'bg-slate-700' : 'bg-slate-100'} rounded-xl flex items-center justify-center shadow-sm`}>
            <span className="text-2xl">{expense.icon}</span>
          </div>
          <div>
            <h3 className={`font-semibold heading-font ${darkMode ? 'text-white' : 'text-slate-900'}`}>{expense.description}</h3>
            <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'} mt-0.5`}>
              Paid by <span className="font-medium">{expense.paidBy}</span> • {formatDate(expense.date)}
            </p>
            {expense.group && (
              <p className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-500'} mt-1`}>
                {expense.group} • {expenseCurrency}
              </p>
            )}
            {expense.splits && expense.splits.length > 0 && (
              <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'} mt-2 space-y-0.5`}>
                <div className="font-medium mb-1">Split:</div>
                {expense.splits.map((split, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <span>• {split.user_name}:</span>
                    <span className="font-medium">{formatCurrency(split.amount, expenseCurrency)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className={`font-bold heading-font text-lg ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            {formatCurrency(expense.amount, expenseCurrency)}
          </div>
          <div className={`text-sm font-medium mt-1 ${
            expense.youOwe > 0 ? 'text-gradient-coral' : expense.youAreOwed > 0 ? 'text-gradient-teal' : darkMode ? 'text-slate-500' : 'text-slate-400'
          }`}>
            {expense.youOwe > 0 ? `You owe ${formatCurrency(expense.youOwe, expenseCurrency)}` :
             expense.youAreOwed > 0 ? `Owed ${formatCurrency(expense.youAreOwed, expenseCurrency)}` :
             'Settled up'}
          </div>
        </div>
      </div>
    </div>
  );
};
