import React, { useState } from 'react';
import { formatCurrency } from '../../utils/currency';

export const ActivityItem = ({ activity, darkMode, currency }) => {
  const [showDetails, setShowDetails] = useState(false);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderExpenseActivity = () => {
    const participantCount = activity.participant_count || activity.participants?.length || 0;
    
    return (
      <>
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-lg">💰</span>
          </div>
          <div className="flex-1 min-w-0">
            {/* Main description */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className={`${darkMode ? 'text-white' : 'text-gray-900'} font-semibold text-base`}>
                  {activity.description}
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-0.5`}>
                  <span className="font-medium">{activity.paid_by_name}</span> paid in{' '}
                  <span className={`font-medium ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                    {activity.group_name}
                  </span>
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className={`text-lg font-bold ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                  {formatCurrency(activity.amount, currency)}
                </p>
              </div>
            </div>

            {/* Participants info */}
            <div className="mt-2 flex items-center gap-4 flex-wrap">
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
              }`}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>{participantCount} {participantCount === 1 ? 'person' : 'people'} affected</span>
              </div>
              <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                {formatDate(activity.date)}
              </div>
            </div>

            {/* Show details button */}
            {activity.participants && activity.participants.length > 0 && (
              <>
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className={`mt-2 text-xs font-medium ${
                    darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                  } flex items-center gap-1`}
                >
                  {showDetails ? '▼' : '▶'} {showDetails ? 'Hide' : 'Show'} split details
                </button>
                
                {/* Expandable split details */}
                {showDetails && (
                  <div className={`mt-3 pt-3 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Split Between:
                    </p>
                    <div className="space-y-1.5">
                      {activity.participants.map((participant, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                            {participant.user_name}
                          </span>
                          <span className={`font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {formatCurrency(participant.amount, currency)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </>
    );
  };

  const renderSettlementActivity = () => {
    return (
      <>
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-lg">💸</span>
          </div>
          <div className="flex-1 min-w-0">
            {/* Main description */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className={`${darkMode ? 'text-white' : 'text-gray-900'} font-semibold text-base`}>
                  Settlement Payment
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-0.5`}>
                  <span className="font-medium">{activity.payer_name}</span> paid{' '}
                  <span className="font-medium">{activity.payee_name}</span> in{' '}
                  <span className={`font-medium ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                    {activity.group_name}
                  </span>
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className={`text-lg font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                  {formatCurrency(activity.amount, currency)}
                </p>
              </div>
            </div>

            {/* Settlement details */}
            <div className="mt-2 flex items-center gap-4 flex-wrap">
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-700'
              }`}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Debt Settled</span>
              </div>
              <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                {formatDate(activity.date)}
              </div>
            </div>

            {/* Notes if available */}
            {activity.notes && (
              <div className={`mt-3 pt-3 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Note:
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {activity.notes}
                </p>
              </div>
            )}
          </div>
        </div>
      </>
    );
  };

  return (
    <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border p-4 hover:shadow-lg transition-shadow duration-200`}>
      {activity.type === 'expense' ? renderExpenseActivity() : renderSettlementActivity()}
    </div>
  );
};
