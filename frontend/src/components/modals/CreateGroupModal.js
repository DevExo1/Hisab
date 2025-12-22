import React, { useState } from 'react';
import { CURRENCIES } from '../../utils/currency';

export const CreateGroupModal = ({ isOpen, onClose, onSubmit, darkMode, friends = [], defaultCurrency = 'USD' }) => {
  const [groupName, setGroupName] = useState('');
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [groupCurrency, setGroupCurrency] = useState(defaultCurrency);
  const [customCurrency, setCustomCurrency] = useState({ code: '', symbol: '', name: '' });
  const [showCustomCurrency, setShowCustomCurrency] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (groupName) {
      let finalCurrency = groupCurrency;

      // If custom currency is being added
      if (showCustomCurrency && customCurrency.code && customCurrency.symbol && customCurrency.name) {
        finalCurrency = customCurrency.code;
        // In a real app, you'd save this custom currency to the database
      }

      onSubmit({
        name: groupName,
        members: ['You', ...selectedFriends],
        balance: 0,
        currency: finalCurrency
      });
      setGroupName('');
      setSelectedFriends([]);
      setGroupCurrency(defaultCurrency);
      setCustomCurrency({ code: '', symbol: '', name: '' });
      setShowCustomCurrency(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 w-full max-w-md`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Create Group</h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Group Name
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name"
              className={`w-full p-3 rounded-lg border ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              required
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Add Members
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
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
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{friend.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Group Currency
            </label>
            <select
              value={groupCurrency}
              onChange={(e) => {
                if (e.target.value === 'custom') {
                  setShowCustomCurrency(true);
                  setGroupCurrency('');
                } else {
                  setShowCustomCurrency(false);
                  setGroupCurrency(e.target.value);
                }
              }}
              className={`w-full p-3 rounded-lg border ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              required
            >
              {CURRENCIES.map(currency => (
                <option key={currency.code} value={currency.code}>
                  {currency.name} ({currency.symbol})
                </option>
              ))}
              <option value="custom">+ Add Custom Currency</option>
            </select>
          </div>

          {showCustomCurrency && (
            <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              <h4 className={`text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Add Custom Currency
              </h4>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={`block text-xs font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Code
                  </label>
                  <input
                    type="text"
                    placeholder="USD"
                    maxLength={3}
                    value={customCurrency.code}
                    onChange={(e) => setCustomCurrency({...customCurrency, code: e.target.value.toUpperCase()})}
                    className={`w-full p-2 text-sm rounded border ${
                      darkMode
                        ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Symbol
                  </label>
                  <input
                    type="text"
                    placeholder="$"
                    maxLength={3}
                    value={customCurrency.symbol}
                    onChange={(e) => setCustomCurrency({...customCurrency, symbol: e.target.value})}
                    className={`w-full p-2 text-sm rounded border ${
                      darkMode
                        ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Name
                  </label>
                  <input
                    type="text"
                    placeholder="US Dollar"
                    value={customCurrency.name}
                    onChange={(e) => setCustomCurrency({...customCurrency, name: e.target.value})}
                    className={`w-full p-2 text-sm rounded border ${
                      darkMode
                        ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCustomCurrency(false)}
                className={`mt-2 text-xs ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
              >
                Cancel custom currency
              </button>
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
              className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Create Group
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
