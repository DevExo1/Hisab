import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../../utils/currency';

export const SettleDebtModal = ({ isOpen, onClose, onSubmit, darkMode, debtInfo, currency }) => {
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (debtInfo) {
      // Default to full amount
      setAmount(debtInfo.total_amount.toString());
    }
  }, [debtInfo]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const amountNum = parseFloat(amount);
    
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (amountNum > debtInfo.total_amount) {
      setError(`Amount cannot exceed ${formatCurrency(debtInfo.total_amount, currency)}`);
      return;
    }

    setIsLoading(true);

    try {
      await onSubmit({
        amount: amountNum,
        notes: notes.trim()
      });
      setAmount('');
      setNotes('');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to record settlement');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !debtInfo) return null;

  const isPartialPayment = parseFloat(amount) < debtInfo.total_amount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={`w-full max-w-md ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} rounded-2xl shadow-2xl p-6 transform transition-all`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold heading-font">Settle Debt</h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
          >
            <span className="text-xl">×</span>
          </button>
        </div>

        <div className={`mb-4 p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
            <strong>{debtInfo.from_user_name}</strong> owes <strong>{debtInfo.to_user_name}</strong>
          </p>
          <p className="text-2xl font-bold text-gradient-coral">
            {formatCurrency(debtInfo.total_amount, currency)}
          </p>
          {debtInfo.expenses && debtInfo.expenses.length > 0 && (
            <p className={`text-xs mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              From {debtInfo.expenses.length} expense{debtInfo.expenses.length > 1 ? 's' : ''}
            </p>
          )}
        </div>

        {error && (
          <div className={`mb-4 p-3 rounded-lg ${darkMode ? 'bg-red-900/30 border border-red-700' : 'bg-red-50 border border-red-200'}`}>
            <p className={`text-sm ${darkMode ? 'text-red-300' : 'text-red-700'}`}>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Settlement Amount
            </label>
            <div className="relative">
              <span className={`absolute left-4 top-1/2 -translate-y-1/2 text-base font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency}
              </span>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className={`w-full p-3 pl-14 rounded-lg border ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                required
                disabled={isLoading}
              />
            </div>
            <div className="flex justify-between mt-2">
              <button
                type="button"
                onClick={() => setAmount((debtInfo.total_amount / 2).toFixed(2))}
                className={`text-xs px-3 py-1 rounded ${
                  darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } transition-colors`}
              >
                Half
              </button>
              <button
                type="button"
                onClick={() => setAmount(debtInfo.total_amount.toFixed(2))}
                className={`text-xs px-3 py-1 rounded ${
                  darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } transition-colors`}
              >
                Full Amount
              </button>
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Cash payment, Venmo, Bank transfer..."
              rows="2"
              className={`w-full p-3 rounded-lg border ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none`}
              disabled={isLoading}
            />
          </div>

          {isPartialPayment && amount && (
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-yellow-900/30 border border-yellow-700' : 'bg-yellow-50 border border-yellow-200'}`}>
              <p className={`text-sm ${darkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>
                💡 Partial payment: {formatCurrency(debtInfo.total_amount - parseFloat(amount), currency)} will remain owed
              </p>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                darkMode
                  ? 'bg-gray-700 text-white hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`flex-1 py-3 px-4 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-lg font-medium transition-all shadow-md ${
                isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:from-teal-600 hover:to-emerald-600'
              }`}
            >
              {isLoading ? 'Recording...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
