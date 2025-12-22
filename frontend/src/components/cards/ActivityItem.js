import React from 'react';
import { formatCurrency } from '../../utils/currency';

export const ActivityItem = ({ activity, darkMode, currency }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-4 mb-3`}>
      <div className="flex items-start space-x-3">
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs font-bold">{activity.type === 'expense' ? '💰' : '💸'}</span>
        </div>
        <div className="flex-1">
          <p className={`${darkMode ? 'text-white' : 'text-gray-900'} font-medium`}>
            {activity.description}
          </p>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
            {formatDate(activity.date)}
          </p>
          {activity.amount && (
            <p className={`text-sm font-semibold mt-1 ${
              activity.type === 'payment' ? 'text-green-600' : 'text-gray-700'
            }`}>
              {formatCurrency(activity.amount, currency)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
