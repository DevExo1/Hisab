import React from 'react';
import { FriendCard } from '../components/cards';

export const Friends = ({ darkMode, currency, friends, setShowAddFriend }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Friends</h2>
        <button
          onClick={() => setShowAddFriend(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors"
        >
          Add Friend
        </button>
      </div>

      <div className="space-y-3">
        {friends.map(friend => (
          <FriendCard key={friend.id} friend={friend} darkMode={darkMode} currency={currency} />
        ))}
      </div>
    </div>
  );
};
