import React, { useState, useEffect } from 'react';
import { CURRENCIES } from '../../utils/currency';

export const EditGroupModal = ({ isOpen, onClose, onSubmit, darkMode, group, friends = [], currentUser }) => {
  const [groupName, setGroupName] = useState('');
  const [selectedFriendIds, setSelectedFriendIds] = useState([]);
  const [currency, setCurrency] = useState('USD');

  // Update local state when group prop changes
  useEffect(() => {
    if (group) {
      setGroupName(group.name || '');
      setCurrency(group.currency || 'USD');
      // Extract current member ids (excluding current user)
      const currentUserId = currentUser?.id;
      const memberIds = (group.members || [])
        .filter((m) => {
          if (!m) return false;
          if (m === 'You') return false;
          if (typeof m === 'object' && m.name === 'You') return false;
          if (typeof m === 'object' && Number.isFinite(currentUserId) && m.id === currentUserId) return false;
          return typeof m === 'object' && Number.isFinite(m.id);
        })
        .map((m) => m.id);
      setSelectedFriendIds(memberIds);
    } else {
      // Clear form when modal closes (group becomes null)
      setGroupName('');
      setSelectedFriendIds([]);
      setCurrency('USD');
    }
  }, [group, currentUser]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (groupName) {
      const currentUserId = currentUser?.id;
      const member_ids = [currentUserId, ...selectedFriendIds]
        .map((id) => parseInt(id, 10))
        .filter((n) => Number.isFinite(n));

      onSubmit({
        ...group,
        name: groupName,
        currency: currency,
        member_ids
      });
      onClose();
    }
  };

  if (!isOpen || !group) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 w-full max-w-md`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Edit Group</h2>
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
              Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className={`w-full p-3 rounded-lg border ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            >
              {CURRENCIES.map(curr => (
                <option key={curr.code} value={curr.code}>
                  {curr.code} - {curr.symbol} ({curr.name})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Group Members
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {friends.map(friend => (
                <label key={friend.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedFriendIds.includes(friend.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedFriendIds([...selectedFriendIds, friend.id]);
                      } else {
                        setSelectedFriendIds(selectedFriendIds.filter((id) => id !== friend.id));
                      }
                    }}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{friend.name}</span>
                </label>
              ))}
            </div>
          </div>

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
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
