import React from 'react';
import { formatCurrency } from '../../utils/currency';

export const SettlementCard = ({ settlement, darkMode, currency, members }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  // Get member names from IDs
  const getUsername = (userId) => {
    const member = members?.find(m => m.id === userId);
    return member?.name || 'Unknown';
  };

  const payerName = getUsername(settlement.payer_id);
  const payeeName = getUsername(settlement.payee_id);

  return (
    <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl border p-5 mb-3 hover-lift card-entrance`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`w-12 h-12 ${darkMode ? 'bg-emerald-900/30' : 'bg-emerald-50'} rounded-xl flex items-center justify-center shadow-sm`}>
            <span className="text-2xl">💸</span>
          </div>
          <div>
            <h3 className={`font-semibold heading-font ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              {settlement.description}
            </h3>
            <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'} mt-0.5`}>
              <span className="font-medium">{payerName}</span> paid{' '}
              <span className="font-medium">{payeeName}</span> • {formatDate(settlement.date)}
            </p>
            <div className={`inline-flex items-center mt-2 px-2 py-1 rounded-md text-xs font-medium ${
              darkMode ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-50 text-emerald-700'
            }`}>
              <span className="mr-1">✓</span> Settlement
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className={`font-bold heading-font text-lg text-gradient-teal`}>
            {formatCurrency(settlement.amount, currency)}
          </div>
          <div className={`text-sm font-medium mt-1 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
            Paid
          </div>
        </div>
      </div>
    </div>
  );
};
