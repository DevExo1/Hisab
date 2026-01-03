import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../utils/currency';
import { PairwiseBalances } from '../components/PairwiseBalances';
import { SettleDebtModal } from '../components/modals/SettleDebtModal';
import { groupAPI, settlementAPI } from '../api';

export const SettlementView = ({ 
  darkMode, 
  currency, 
  selectedGroup,
  onBack,
  user,
  onSettlementRecorded
}) => {
  const [viewType, setViewType] = useState('simplified'); // 'simplified' or 'detailed'
  const [simplifiedSettlements, setSimplifiedSettlements] = useState([]);
  const [pairwiseData, setPairwiseData] = useState([]);
  const [selectedDebt, setSelectedDebt] = useState(null);
  const [showSettleModal, setShowSettleModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastSettlement, setLastSettlement] = useState(null);
  const [unlockedPayments, setUnlockedPayments] = useState(new Set()); // Track unlocked other-user payments

  useEffect(() => {
    if (selectedGroup) {
      loadSettlements();
    }
  }, [selectedGroup, viewType]);

  const loadSettlements = async () => {
    try {
      setIsLoading(true);

      if (viewType === 'detailed') {
        // Load pairwise balances
        const data = await groupAPI.getGroupPairwiseBalances(selectedGroup.id);
        const balances = data.pairwise_balances || [];

        // Sort: Current user's debts first, then others
        const sortedBalances = balances.sort((a, b) => {
          const aIsCurrentUser = a.from_user_id === user?.id;
          const bIsCurrentUser = b.from_user_id === user?.id;

          if (aIsCurrentUser && !bIsCurrentUser) return -1;
          if (!aIsCurrentUser && bIsCurrentUser) return 1;
          return b.total_amount - a.total_amount; // Then by amount
        });

        setPairwiseData(sortedBalances);
      } else {
        // Load simplified settlements
        const data = await groupAPI.getGroupBalances(selectedGroup.id);
        const settlements = data.settlements || [];

        // Sort: Current user's debts first, then others
        const sortedSettlements = settlements.sort((a, b) => {
          const aIsCurrentUser = a.from_user_id === user?.id;
          const bIsCurrentUser = b.from_user_id === user?.id;

          if (aIsCurrentUser && !bIsCurrentUser) return -1;
          if (!aIsCurrentUser && bIsCurrentUser) return 1;
          return b.amount - a.amount; // Then by amount
        });

        setSimplifiedSettlements(sortedSettlements);
      }
    } catch (error) {

    } finally {
      setIsLoading(false);
    }
  };

  const handleSettleClick = (settlement, index) => {
    // Check if this is another user's payment and if it's locked
    const isOtherUser = settlement.from_user_id !== user?.id;
    const paymentKey = `${settlement.from_user_id}-${settlement.to_user_id}-${index}`;
    
    if (isOtherUser && !unlockedPayments.has(paymentKey)) {
      // Payment is locked, don't open modal
      return;
    }
    
    // For simplified view, convert settlement to debt format
    if (viewType === 'simplified') {
      setSelectedDebt({
        from_user_id: settlement.from_user_id,
        from_user_name: settlement.from_user_name,
        to_user_id: settlement.to_user_id,
        to_user_name: settlement.to_user_name,
        total_amount: settlement.amount,
        expenses: [] // Simplified doesn't show expense breakdown
      });
    } else {
      // Detailed view already has the right format
      setSelectedDebt(settlement);
    }
    setShowSettleModal(true);
  };
  
  const handleUnlockPayment = (settlement, index) => {
    const paymentKey = `${settlement.from_user_id}-${settlement.to_user_id}-${index}`;
    setUnlockedPayments(prev => new Set([...prev, paymentKey]));
  };

  const handleRecordSettlement = async (settlementData) => {
    try {
      await settlementAPI.recordSettlement({
        groupId: selectedGroup.id,
        payerId: selectedDebt.from_user_id,
        payeeId: selectedDebt.to_user_id,
        amount: settlementData.amount,
        notes: settlementData.notes
      });

      setLastSettlement({
        from_user: selectedDebt.from_user_name,
        to_user: selectedDebt.to_user_name,
        amount: settlementData.amount,
        isPartial: settlementData.amount < selectedDebt.total_amount
      });
      setShowSettleModal(false);
      setShowSuccessModal(true);
      // Reload settlements
      loadSettlements();
      // Notify parent to refresh all data (including dashboard balances)
      if (onSettlementRecorded) {
        onSettlementRecorded();
      }
    } catch (error) {

      const message = error?.response?.data?.detail || error?.message || 'Failed to record settlement';
      throw new Error(message);
    }
  };

  const handleSettleAnother = () => {
    setShowSuccessModal(false);
    setLastSettlement(null);
  };

  const handleDone = () => {
    setShowSuccessModal(false);
    setLastSettlement(null);
    onBack();
  };

  if (!selectedGroup) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className={darkMode ? 'text-white' : 'text-gray-900'}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
          >
            <span className="text-xl">←</span>
          </button>
          <div>
            <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Settle Up
            </h1>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {selectedGroup.name}
            </p>
          </div>
        </div>
      </div>

      {/* View Type Toggle */}
      <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl border p-6`}>
        <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
          Choose Settlement Method
        </h3>
        <div className="flex space-x-4">
          <button
            onClick={() => setViewType('simplified')}
            className={`flex-1 p-4 rounded-lg border-2 transition-all ${
              viewType === 'simplified'
                ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                : darkMode ? 'border-slate-700 bg-slate-700/50 hover:border-slate-600' : 'border-slate-200 bg-slate-50 hover:border-slate-300'
            }`}
          >
            <div className="text-center">
              <div className="text-3xl mb-2">⚡</div>
              <h4 className={`font-semibold mb-1 ${viewType === 'simplified' ? 'text-teal-600 dark:text-teal-400' : darkMode ? 'text-white' : 'text-slate-900'}`}>
                Simplified
              </h4>
              <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Minimum payments to settle all debts
              </p>
            </div>
          </button>
          <button
            onClick={() => setViewType('detailed')}
            className={`flex-1 p-4 rounded-lg border-2 transition-all ${
              viewType === 'detailed'
                ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                : darkMode ? 'border-slate-700 bg-slate-700/50 hover:border-slate-600' : 'border-slate-200 bg-slate-50 hover:border-slate-300'
            }`}
          >
            <div className="text-center">
              <div className="text-3xl mb-2">📊</div>
              <h4 className={`font-semibold mb-1 ${viewType === 'detailed' ? 'text-teal-600 dark:text-teal-400' : darkMode ? 'text-white' : 'text-slate-900'}`}>
                Detailed
              </h4>
              <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                See exactly who owes whom and why
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Settlement List */}
      <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl border p-6`}>
        <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
          {viewType === 'simplified' ? 'Suggested Payments' : 'Pairwise Debts'}
        </h3>

        {isLoading ? (
          <div className="text-center py-8">
            <p className={darkMode ? 'text-slate-400' : 'text-slate-600'}>Loading...</p>
          </div>
        ) : viewType === 'simplified' ? (
          // Simplified View
          <div className="space-y-3">
            {simplifiedSettlements.length === 0 ? (
              <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <p className="text-4xl mb-3">🎉</p>
                <p className="font-semibold">All settled up!</p>
                <p className="text-sm mt-1">No outstanding debts in this group.</p>
              </div>
            ) : (
              <>
                {/* Show user's payments first */}
                {simplifiedSettlements.filter(s => s.from_user_id === user?.id).length > 0 && (
                  <div className="mb-4">
                    <p className={`text-sm font-semibold ${darkMode ? 'text-teal-400' : 'text-teal-600'} mb-2`}>
                      💳 Your Payments ({simplifiedSettlements.filter(s => s.from_user_id === user?.id).length}):
                    </p>
                  </div>
                )}
                
                {simplifiedSettlements.map((settlement, index) => {
                  const isCurrentUser = settlement.from_user_id === user?.id;
                  const paymentKey = `${settlement.from_user_id}-${settlement.to_user_id}-${index}`;
                  const isUnlocked = unlockedPayments.has(paymentKey);
                  const isLocked = !isCurrentUser && !isUnlocked;
                  
                  // Add separator before other users' payments
                  const showSeparator = index > 0 && 
                    simplifiedSettlements[index - 1].from_user_id === user?.id && 
                    !isCurrentUser;
                  
                  return (
                    <React.Fragment key={index}>
                      {showSeparator && (
                        <div className="my-4">
                          <p className={`text-sm font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-600'} mb-2`}>
                            👥 Other Payments ({simplifiedSettlements.filter(s => s.from_user_id !== user?.id).length}):
                          </p>
                        </div>
                      )}
                      <div
                        className={`flex items-center justify-between p-4 rounded-lg border ${
                          isCurrentUser 
                            ? darkMode ? 'bg-teal-900/20 border-teal-700' : 'bg-teal-50 border-teal-200'
                            : darkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-200'
                        } hover-lift relative ${isLocked ? 'opacity-60' : ''}`}
                      >
                        {isLocked && (
                          <div className="absolute top-2 right-2">
                            <span className="text-lg">🔒</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-2 flex-1">
                          {isCurrentUser && <span className="text-lg">👤</span>}
                          <span className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                            {settlement.from_user_name}
                          </span>
                          <span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>pays</span>
                          <span className="text-xl font-bold text-gradient-coral">
                            {formatCurrency(settlement.amount, selectedGroup.currency || currency)}
                          </span>
                          <span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>to</span>
                          <span className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                            {settlement.to_user_name}
                          </span>
                        </div>
                        {isLocked ? (
                          <button
                            onClick={() => handleUnlockPayment(settlement, index)}
                            className={`ml-4 px-4 py-2 rounded-lg font-medium transition-all ${
                              darkMode 
                                ? 'bg-slate-600 text-slate-300 hover:bg-slate-500' 
                                : 'bg-slate-300 text-slate-700 hover:bg-slate-400'
                            }`}
                          >
                            🔓 Unlock to Settle
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSettleClick(settlement, index)}
                            className="ml-4 px-6 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-lg font-medium hover:from-teal-600 hover:to-emerald-600 transition-all shadow-md"
                          >
                            Settle
                          </button>
                        )}
                      </div>
                    </React.Fragment>
                  );
                })}
              </>
            )}
          </div>
        ) : (
          // Detailed View
          <PairwiseBalances
            pairwiseData={pairwiseData}
            darkMode={darkMode}
            currency={selectedGroup.currency || currency}
            onSettleClick={handleSettleClick}
            user={user}
            unlockedPayments={unlockedPayments}
            onUnlockPayment={handleUnlockPayment}
          />
        )}
      </div>

      {/* Settle Debt Modal */}
      <SettleDebtModal
        isOpen={showSettleModal}
        onClose={() => setShowSettleModal(false)}
        onSubmit={handleRecordSettlement}
        darkMode={darkMode}
        debtInfo={selectedDebt}
        currency={selectedGroup.currency || currency}
      />

      {/* Success Modal */}
      {showSuccessModal && lastSettlement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`w-full max-w-md ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} rounded-2xl shadow-2xl p-6 transform transition-all`}>
            <div className="text-center">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-2xl font-bold mb-2">Payment Recorded!</h2>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
                <strong>{lastSettlement.from_user}</strong> paid{' '}
                <strong className="text-gradient-teal">
                  {formatCurrency(lastSettlement.amount, selectedGroup.currency || currency)}
                </strong>{' '}
                to <strong>{lastSettlement.to_user}</strong>
              </p>
              {lastSettlement.isPartial && (
                <p className={`text-sm ${darkMode ? 'text-yellow-400' : 'text-yellow-700'} mb-4`}>
                  💡 Partial payment recorded. Some debt remains.
                </p>
              )}
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleSettleAnother}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                    darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                  }`}
                >
                  Settle Another
                </button>
                <button
                  onClick={handleDone}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-lg font-medium hover:from-teal-600 hover:to-emerald-600 transition-all shadow-md"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
