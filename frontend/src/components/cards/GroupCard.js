import React from 'react';
import { formatCurrency } from '../../utils/currency';

export const GroupCard = ({ group, darkMode, currency, onEditGroup, onAddExpense, onViewDetails }) => {
  // Use group's currency if available, otherwise fall back to default currency
  const groupCurrency = group.currency || currency;

  return (
    <div
      className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl border p-5 mb-3 hover-lift group relative card-entrance`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <div className="w-14 h-14 gradient-teal rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl heading-font">{group.name.charAt(0)}</span>
          </div>
          <div
            className="flex-1 cursor-pointer"
            onClick={() => onViewDetails && onViewDetails(group)}
          >
            <h3 className={`font-semibold text-lg heading-font ${darkMode ? 'text-white' : 'text-slate-900'} hover:opacity-80 transition-opacity`}>{group.name}</h3>
            <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'} mt-0.5`}>
              <span className="font-medium">{group.members.length} members</span> • {groupCurrency}
            </p>
            <p className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-500'} mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity`}>
              👁️ Click to view details
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEditGroup(group);
            }}
            className={`opacity-0 group-hover:opacity-100 transition-all p-2 rounded-lg icon-wiggle ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}
          >
            <span className="text-lg">✏️</span>
          </button>
          <div className="text-right">
            {group.balance !== 0 && (
              <div className={`font-bold heading-font text-lg ${group.balance > 0 ? 'text-gradient-teal' : 'text-gradient-coral'}`}>
                {group.balance > 0 ? '+' : ''}{formatCurrency(group.balance, groupCurrency)}
              </div>
            )}
            <div className={`text-xs font-medium ${darkMode ? 'text-slate-500' : 'text-slate-500'} mt-1`}>
              {group.balance === 0 ? 'Settled up' : group.balance > 0 ? 'You are owed' : 'You owe'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
