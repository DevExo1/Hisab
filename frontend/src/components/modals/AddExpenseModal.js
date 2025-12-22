import React, { useState, useEffect } from 'react';
import { CURRENCIES } from '../../utils/currency';

export const AddExpenseModal = ({ isOpen, onClose, onSubmit, darkMode, friends = [], currency, groups = [], selectedGroup = null }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('You');
  const [splitType, setSplitType] = useState('equal');
  const [selectedFriends, setSelectedFriends] = useState(friends.length > 0 ? [friends[0].name] : []);
  const [customSplits, setCustomSplits] = useState({});
  const [groupId, setGroupId] = useState(selectedGroup?.id || '');

  // Reset customSplits when split type changes
  useEffect(() => {
    setCustomSplits({});
  }, [splitType]);

  // Get the selected group and its currency
  const currentGroup = groups.find(g => g.id === parseInt(groupId)) || selectedGroup;
  const expenseCurrency = currentGroup?.currency || currency;
  const currencySymbol = CURRENCIES.find(c => c.code === expenseCurrency)?.symbol || '$';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (description && amount && (groupId || !groups.length)) {
      // Validation for percentage split
      if (splitType === 'percentage') {
        const participants = getParticipants();
        const totalPercentage = participants.reduce((sum, participant) => {
          return sum + (parseFloat(customSplits[participant]) || 0);
        }, 0);
        
        if (Math.abs(totalPercentage - 100) > 0.1) {
          alert(`Percentage split must total 100%. Current total: ${totalPercentage.toFixed(1)}%`);
          return;
        }
      }
      
      // Validation for exact split
      if (splitType === 'exact') {
        const participants = getParticipants();
        const totalAmount = participants.reduce((sum, participant) => {
          return sum + (parseFloat(customSplits[participant]) || 0);
        }, 0);
        
        if (Math.abs(totalAmount - parseFloat(amount)) > 0.01) {
          alert(`Exact split amounts must total ${parseFloat(amount).toFixed(2)}. Current total: ${totalAmount.toFixed(2)}`);
          return;
        }
      }
      
      onSubmit({
        description,
        amount: parseFloat(amount),
        paidBy,
        splitType,
        participants: selectedFriends.concat(paidBy === 'You' ? ['You'] : []),
        customSplits: splitType === 'equal' ? {} : customSplits,
        date: new Date().toISOString(),
        icon: '🍽️',
        groupId: groupId ? parseInt(groupId) : null,
        groupName: currentGroup?.name || null,
        currency: expenseCurrency
      });
      setDescription('');
      setAmount('');
      setPaidBy('You');
      setSelectedFriends(friends.length > 0 ? [friends[0].name] : []);
      setCustomSplits({});
      setGroupId(selectedGroup?.id || '');
      onClose();
    }
  };

  const handleCustomSplitChange = (friendName, value) => {
    setCustomSplits(prev => ({
      ...prev,
      [friendName]: parseFloat(value) || 0
    }));
  };

  const getParticipants = () => {
    // Filter out any invalid friends that might not exist in current context
    const validFriends = selectedFriends.filter(friendName => 
      friendName && typeof friendName === 'string'
    );
    const participants = [...validFriends];
    if (!participants.includes('You')) {
      participants.push('You');
    }
    return participants;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Add Expense</h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {groups.length > 0 && (
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Select Group
              </label>
              <select
                value={groupId}
                onChange={(e) => {
                  setGroupId(e.target.value);
                  // Reset selected friends when group changes
                  const newGroup = groups.find(g => g.id === parseInt(e.target.value));
                  if (newGroup) {
                    const groupFriends = newGroup.members.filter(member => member !== 'You');
                    setSelectedFriends(groupFriends.length > 0 ? [groupFriends[0]] : []);
                  }
                }}
                className={`w-full p-3 rounded-lg border ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                required={groups.length > 0}
              >
                <option value="">Select a group...</option>
                {groups.map(group => (
                  <option key={group.id} value={group.id}>
                    {group.name} ({group.currency || currency})
                  </option>
                ))}
                <option value="none">No group (personal expense)</option>
              </select>
              {currentGroup && (
                <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Currency: {expenseCurrency} • {currentGroup.members.length} members
                </p>
              )}
            </div>
          )}

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter expense description"
              className={`w-full p-3 rounded-lg border ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
              required
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Amount ({currencySymbol})
            </label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className={`w-full p-3 rounded-lg border ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
              required
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Paid by
            </label>
            <select
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
              className={`w-full p-3 rounded-lg border ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
            >
              <option value="You">You</option>
              {friends.map(friend => (
                <option key={friend.id} value={friend.name}>{friend.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Split with
            </label>
            <div className="space-y-2">
              {friends.map(friend => (
                <label key={friend.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedFriends.includes(friend.name)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedFriends([...selectedFriends, friend.name]);
                      } else {
                        setSelectedFriends(selectedFriends.filter(f => f !== friend.name));
                      }
                    }}
                    className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                  />
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{friend.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Split Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSplitType('equal')}
                className={`p-2 rounded-lg border text-sm font-medium ${
                  splitType === 'equal'
                    ? 'bg-green-600 text-white border-green-600'
                    : `${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`
                }`}
              >
                Equally
              </button>
              <button
                type="button"
                onClick={() => setSplitType('percentage')}
                className={`p-2 rounded-lg border text-sm font-medium ${
                  splitType === 'percentage'
                    ? 'bg-green-600 text-white border-green-600'
                    : `${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`
                }`}
              >
                Percentage
              </button>
              <button
                type="button"
                onClick={() => setSplitType('exact')}
                className={`p-2 rounded-lg border text-sm font-medium ${
                  splitType === 'exact'
                    ? 'bg-green-600 text-white border-green-600'
                    : `${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`
                }`}
              >
                Exact Amount
              </button>
            </div>
          </div>

          {splitType === 'percentage' && (
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Split Percentages
              </label>
              <div className="space-y-2">
                {getParticipants().map(participant => (
                  <div key={participant} className="flex items-center space-x-2">
                    <span className={`w-20 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {participant}:
                    </span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      placeholder="0"
                      value={customSplits[participant] || ''}
                      onChange={(e) => handleCustomSplitChange(participant, e.target.value)}
                      className={`flex-1 p-2 rounded border text-sm ${
                        darkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {splitType === 'exact' && (
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Exact Amounts
              </label>
              <div className="space-y-2">
                {getParticipants().map(participant => (
                  <div key={participant} className="flex items-center space-x-2">
                    <span className={`w-20 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {participant}:
                    </span>
                    <span className="text-sm">{currencySymbol}</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={customSplits[participant] || ''}
                      onChange={(e) => handleCustomSplitChange(participant, e.target.value)}
                      className={`flex-1 p-2 rounded border text-sm ${
                        darkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-3 px-4 rounded-lg border ${
                darkMode
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              } font-medium transition-colors`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Add Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
