import React, { useState } from 'react';
import { CURRENCIES } from '../../utils/currency';

export const Header = ({ user, darkMode, toggleDarkMode, currency, setCurrency, onProfileClick, onLogout }) => {
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border-b px-4 py-4 flex items-center justify-between shadow-sm`}>
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 gradient-teal rounded-xl flex items-center justify-center shadow-lg icon-wiggle">
          <span className="text-white font-bold text-lg heading-font">₹</span>
        </div>
        <div>
          <h1 className={`text-2xl font-bold heading-font ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            Hisab
          </h1>
          <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'} -mt-1`}>
            Group Accounts Manager
          </p>
        </div>
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
          className={`p-2.5 rounded-xl ${darkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'} transition-colors icon-wiggle`}
        >
          <span className="text-xl">{darkMode ? '🌞' : '🌙'}</span>
        </button>
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-9 h-9 gradient-teal rounded-full flex items-center justify-center shadow-md">
              <span className="text-white font-semibold heading-font">{user?.name?.charAt(0) || '?'}</span>
            </div>
            <span className={`font-medium heading-font ${darkMode ? 'text-white' : 'text-slate-900'} hidden sm:inline`}>{user?.name || 'Loading...'}</span>
            <span className="text-xs hidden sm:inline">▼</span>
          </button>

          {showProfileMenu && (
            <div className={`absolute top-full right-0 mt-2 w-56 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg shadow-lg z-50`}>
              <div className={`px-4 py-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{user?.name}</p>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{user?.email}</p>
              </div>
              
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  onProfileClick();
                }}
                className={`w-full px-4 py-3 text-left text-sm ${darkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-50 text-gray-900'} flex items-center space-x-3`}
              >
                <span className="text-lg">⚙️</span>
                <span>Profile Settings</span>
              </button>
              
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  onLogout();
                }}
                className={`w-full px-4 py-3 text-left text-sm ${darkMode ? 'hover:bg-gray-700 text-red-400' : 'hover:bg-gray-50 text-red-600'} flex items-center space-x-3 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
              >
                <span className="text-lg">🚪</span>
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
