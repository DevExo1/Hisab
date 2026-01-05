import React from 'react';
import { formatCurrency } from '../../utils/currency';

export const FriendCard = ({ friend, darkMode, currency }) => {
  return (
    <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl border p-5 mb-3 hover-lift cursor-pointer card-entrance`}>
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 gradient-teal rounded-full flex items-center justify-center shadow-md">
          <span className="text-white font-bold text-lg heading-font">{friend.name.charAt(0)}</span>
        </div>
        <div>
          <h3 className={`font-semibold heading-font ${darkMode ? 'text-white' : 'text-slate-900'}`}>{friend.name}</h3>
          <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'} mt-0.5`}>{friend.email}</p>
        </div>
      </div>
    </div>
  );
};
