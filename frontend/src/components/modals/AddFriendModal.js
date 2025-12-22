import React, { useState } from 'react';

export const AddFriendModal = ({ isOpen, onClose, onSubmit, darkMode }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (email) {
      setIsLoading(true);
      setError('');
      
      try {
        await onSubmit({ email });
        setEmail('');
        onClose();
      } catch (err) {
        setError(err.message || 'Failed to add friend');
      } finally {
        setIsLoading(false);
      }
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
            💡 <strong>How it works:</strong> Your friend must be registered in the system first. Ask them to sign up, then you can add them by their email address.
          </p>
        </div>

        {error && (
          <div className={`mb-4 p-3 rounded-lg ${darkMode ? 'bg-red-900/30 border border-red-700' : 'bg-red-50 border border-red-200'}`}>
            <p className={`text-sm ${darkMode ? 'text-red-300' : 'text-red-700'}`}>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Friend's Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your friend's email"
              className={`w-full p-3 rounded-lg border ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
              required
              disabled={isLoading}
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
              disabled={isLoading}
              className={`flex-1 py-3 px-4 bg-purple-600 text-white rounded-lg font-medium transition-colors ${
                isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-700'
              }`}
            >
              {isLoading ? 'Adding Friend...' : 'Add Friend'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
