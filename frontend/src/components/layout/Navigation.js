import React from 'react';

export const Navigation = ({ activeTab, setActiveTab, darkMode, groupsCount = 0, friendsCount = 0 }) => {
  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: '🏠' },
    { id: 'expenses', name: 'Expenses', icon: '💰' },
    { id: 'groups', name: 'Groups', icon: '👥', count: groupsCount },
    { id: 'friends', name: 'Friends', icon: '👤', count: friendsCount },
    { id: 'activity', name: 'Activity', icon: '📊' }
  ];

  return (
    <nav className={`${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border-b px-4`}>
      <div className="flex space-x-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-3 px-2 border-b-2 font-medium text-sm transition-colors relative ${
              activeTab === tab.id
                ? 'border-green-500 text-green-600'
                : `border-transparent ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'} hover:border-gray-300`
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.name}
            {tab.count !== undefined && tab.count > 0 && (
              <span className={`ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none rounded-full ${
                activeTab === tab.id
                  ? 'bg-green-500 text-white'
                  : 'bg-blue-500 text-white'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
};
