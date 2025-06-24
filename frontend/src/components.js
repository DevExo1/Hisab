import React, { useState } from 'react';

// Currency data
const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' }
];

// Format currency function
export const formatCurrency = (amount, currency) => {
  const currencyObj = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];
  if (currency === 'JPY') {
    return `${currencyObj.symbol}${Math.round(amount)}`;
  }
  return `${currencyObj.symbol}${amount.toFixed(2)}`;
};

// Header Component with Currency Selector
export const Header = ({ user, darkMode, toggleDarkMode, currency, setCurrency, onProfileClick }) => {
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);

  return (
    <header className={`${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border-b px-4 py-3 flex items-center justify-between`}>
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">S</span>
        </div>
        <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Splitwise</h1>
      </div>
      <div className="flex items-center space-x-4">
        {/* Currency Selector */}
        <div className="relative">
          <button
            onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
            className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} flex items-center space-x-1`}
          >
            <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {CURRENCIES.find(c => c.code === currency)?.symbol || '$'}
            </span>
            <span className="text-xs">▼</span>
          </button>
          
          {showCurrencyDropdown && (
            <div className={`absolute top-full right-0 mt-1 w-48 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg shadow-lg z-50`}>
              {CURRENCIES.map(curr => (
                <button
                  key={curr.code}
                  onClick={() => {
                    setCurrency(curr.code);
                    setShowCurrencyDropdown(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:${darkMode ? 'bg-gray-700' : 'bg-gray-50'} flex items-center justify-between ${
                    currency === curr.code ? 'bg-green-50 text-green-600' : darkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  <span>{curr.name}</span>
                  <span className="font-semibold">{curr.symbol}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={toggleDarkMode}
          className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
        >
          {darkMode ? '🌞' : '🌙'}
        </button>
        <button
          onClick={onProfileClick}
          className="flex items-center space-x-2"
        >
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">{user.name.charAt(0)}</span>
          </div>
          <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{user.name}</span>
        </button>
      </div>
    </header>
  );
};

// Navigation Component
export const Navigation = ({ activeTab, setActiveTab, darkMode }) => {
  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: '🏠' },
    { id: 'expenses', name: 'Expenses', icon: '💰' },
    { id: 'groups', name: 'Groups', icon: '👥' },
    { id: 'friends', name: 'Friends', icon: '👤' },
    { id: 'activity', name: 'Activity', icon: '📊' }
  ];

  return (
    <nav className={`${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border-b px-4`}>
      <div className="flex space-x-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-3 px-2 border-b-2 font-medium text-sm transition-colors ${
              activeTab === tab.id
                ? 'border-green-500 text-green-600'
                : `border-transparent ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'} hover:border-gray-300`
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.name}
          </button>
        ))}
      </div>
    </nav>
  );
};

// Balance Card Component
export const BalanceCard = ({ darkMode, currency }) => {
  return (
    <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border p-6 mb-6`}>
      <div className="text-center">
        <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Your Balance</h2>
        <div className="flex justify-center space-x-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{formatCurrency(147.50, currency)}</div>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>You are owed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-500">{formatCurrency(68.25, currency)}</div>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>You owe</div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-xl font-bold text-green-600">{formatCurrency(79.25, currency)}</div>
          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total balance</div>
        </div>
      </div>
    </div>
  );
};

// Expense Card Component
export const ExpenseCard = ({ expense, darkMode, currency }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-4 mb-3 hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <span className="text-lg">{expense.icon}</span>
          </div>
          <div>
            <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{expense.description}</h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Paid by {expense.paidBy} • {formatDate(expense.date)}
            </p>
            {expense.group && (
              <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                {expense.group}
              </p>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {formatCurrency(expense.amount, currency)}
          </div>
          <div className={`text-sm ${
            expense.youOwe > 0 ? 'text-orange-500' : expense.youAreOwed > 0 ? 'text-green-600' : 'text-gray-500'
          }`}>
            {expense.youOwe > 0 ? `You owe ${formatCurrency(expense.youOwe, currency)}` : 
             expense.youAreOwed > 0 ? `You are owed ${formatCurrency(expense.youAreOwed, currency)}` :
             'Settled up'}
          </div>
        </div>
      </div>
    </div>
  );
};

// Group Card Component
export const GroupCard = ({ group, darkMode, currency, onEditGroup }) => {
  return (
    <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-4 mb-3 hover:shadow-md transition-shadow cursor-pointer group relative`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">{group.name.charAt(0)}</span>
          </div>
          <div>
            <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{group.name}</h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {group.members.length} members
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEditGroup(group);
            }}
            className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          >
            ✏️
          </button>
          <div className="text-right">
            {group.balance !== 0 && (
              <div className={`font-semibold ${group.balance > 0 ? 'text-green-600' : 'text-orange-500'}`}>
                {group.balance > 0 ? '+' : ''}{formatCurrency(group.balance, currency)}
              </div>
            )}
            <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              {group.balance === 0 ? 'Settled up' : group.balance > 0 ? 'You are owed' : 'You owe'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Friend Card Component
export const FriendCard = ({ friend, darkMode, currency }) => {
  return (
    <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-4 mb-3 hover:shadow-md transition-shadow cursor-pointer`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold">{friend.name.charAt(0)}</span>
          </div>
          <div>
            <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{friend.name}</h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{friend.email}</p>
            {friend.status && (
              <p className={`text-xs ${friend.status === 'joined' ? 'text-green-500' : 'text-orange-500'}`}>
                {friend.status === 'joined' ? '✓ Joined Splitwise' : '⏳ Invitation sent'}
              </p>
            )}
          </div>
        </div>
        <div className="text-right">
          {friend.balance !== 0 && (
            <div className={`font-semibold ${friend.balance > 0 ? 'text-green-600' : 'text-orange-500'}`}>
              {friend.balance > 0 ? '+' : ''}{formatCurrency(friend.balance, currency)}
            </div>
          )}
          <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
            {friend.balance === 0 ? 'Settled up' : friend.balance > 0 ? 'owes you' : 'you owe'}
          </div>
        </div>
      </div>
    </div>
  );
};

// Add Expense Modal
export const AddExpenseModal = ({ isOpen, onClose, onSubmit, darkMode, friends = [], currency }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('You');
  const [splitType, setSplitType] = useState('equal');
  const [selectedFriends, setSelectedFriends] = useState(friends.length > 0 ? [friends[0].name] : []);
  const [customSplits, setCustomSplits] = useState({});

  const currencySymbol = CURRENCIES.find(c => c.code === currency)?.symbol || '$';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (description && amount) {
      onSubmit({
        description,
        amount: parseFloat(amount),
        paidBy,
        splitType,
        participants: selectedFriends.concat(paidBy === 'You' ? ['You'] : []),
        customSplits: splitType === 'equal' ? {} : customSplits,
        date: new Date().toISOString(),
        icon: '🍽️'
      });
      setDescription('');
      setAmount('');
      setPaidBy('You');
      setSelectedFriends(friends.length > 0 ? [friends[0].name] : []);
      setCustomSplits({});
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
    const participants = [...selectedFriends];
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

// Create Group Modal
export const CreateGroupModal = ({ isOpen, onClose, onSubmit, darkMode, friends = [] }) => {
  const [groupName, setGroupName] = useState('');
  const [selectedFriends, setSelectedFriends] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (groupName) {
      onSubmit({
        name: groupName,
        members: ['You', ...selectedFriends],
        balance: 0
      });
      setGroupName('');
      setSelectedFriends([]);
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

// Edit Group Modal
export const EditGroupModal = ({ isOpen, onClose, onSubmit, darkMode, group, friends = [] }) => {
  const [groupName, setGroupName] = useState(group?.name || '');
  const [selectedFriends, setSelectedFriends] = useState(
    group?.members?.filter(member => member !== 'You') || []
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (groupName) {
      onSubmit({
        ...group,
        name: groupName,
        members: ['You', ...selectedFriends]
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
              Group Members
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

// Add Friend Modal
export const AddFriendModal = ({ isOpen, onClose, onSubmit, darkMode }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name && email) {
      onSubmit({
        name,
        email,
        balance: 0,
        status: 'invited'
      });
      setName('');
      setEmail('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 w-full max-w-md`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Add Friend</h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          >
            ✕
          </button>
        </div>

        <div className={`mb-4 p-3 rounded-lg ${darkMode ? 'bg-blue-900' : 'bg-blue-50'} border ${darkMode ? 'border-blue-700' : 'border-blue-200'}`}>
          <p className={`text-sm ${darkMode ? 'text-blue-200' : 'text-blue-800'}`}>
            <strong>How it works:</strong> Your friend will receive an email invitation to join Splitwise. They can create their account and start splitting expenses with you!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter friend's name"
              className={`w-full p-3 rounded-lg border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
              required
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter friend's email"
              className={`w-full p-3 rounded-lg border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
              required
            />
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
              className="flex-1 py-3 px-4 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              Send Invitation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Login Modal
export const LoginModal = ({ isOpen, onClose, darkMode }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // This would normally handle login/signup logic
    console.log(isLogin ? 'Login' : 'Signup', { email, password, name });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 w-full max-w-md`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {isLogin ? 'Login to Splitwise' : 'Join Splitwise'}
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className={`w-full p-3 rounded-lg border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                required={!isLogin}
              />
            </div>
          )}

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
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
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className={`w-full p-3 rounded-lg border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            {isLogin ? 'Login' : 'Create Account'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} hover:underline`}
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Activity Item Component
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