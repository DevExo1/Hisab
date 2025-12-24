import React from 'react';
import { formatCurrency } from '../../utils/currency';

export const BalanceCard = ({ darkMode, currency, youOwe = {}, youAreOwed = {}, currencies = [] }) => {
  // Handle both old format (number) and new format (object)
  const isMultiCurrency = typeof youOwe === 'object' && typeof youAreOwed === 'object';
  
  if (!isMultiCurrency) {
    // Fallback for old format
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
  }

  // Multi-currency display
  const activeCurrencies = currencies.length > 0 ? currencies : Object.keys({...youOwe, ...youAreOwed});
  
  return (
    <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'glass-card'} rounded-2xl border p-8 mb-6 shadow-xl hover-lift`}>
      <div className="text-center">
        <h2 className={`text-xl font-bold heading-font mb-6 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Your Balance</h2>
        
        {activeCurrencies.length === 0 ? (
          <div className={`text-lg ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            No balance yet
          </div>
        ) : (
          <div className="space-y-6">
            {activeCurrencies.map(curr => {
              const owed = youAreOwed[curr] || 0;
              const owing = youOwe[curr] || 0;
              const netBalance = owed - owing;
              
              return (
                <div key={curr} className={`${activeCurrencies.length > 1 ? 'pb-6 border-b ' + (darkMode ? 'border-slate-700' : 'border-slate-200') : ''}`}>
                  {activeCurrencies.length > 1 && (
                    <div className={`text-sm font-bold uppercase tracking-wide mb-3 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      {curr}
                    </div>
                  )}
                  
                  <div className="flex justify-center gap-12 mb-4">
                    <div className="text-center balance-animate">
                      <div className="text-2xl font-bold heading-font text-gradient-teal mb-1">
                        {formatCurrency(owed, curr)}
                      </div>
                      <div className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        You are owed
                      </div>
                    </div>
                    <div className="text-center balance-animate">
                      <div className="text-2xl font-bold heading-font text-gradient-coral mb-1">
                        {formatCurrency(owing, curr)}
                      </div>
                      <div className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        You owe
                      </div>
                    </div>
                  </div>
                  
                  <div className={`text-xl font-bold heading-font balance-animate ${netBalance >= 0 ? 'text-gradient-teal' : 'text-gradient-coral'}`}>
                    {netBalance === 0 ? (
                      <span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>Settled up</span>
                    ) : (
                      <>
                        {formatCurrency(Math.abs(netBalance), curr)}
                        <span className={`text-xs font-medium ml-2 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                          {netBalance > 0 ? 'net owed to you' : 'net you owe'}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
