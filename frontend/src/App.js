import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import {
  Header,
  Navigation,
  BalanceCard,
  ExpenseCard,
  GroupCard,
  FriendCard,
  AddExpenseModal,
  CreateGroupModal,
  EditGroupModal,
  AddFriendModal,
  LoginModal,
  ActivityItem
} from './components';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [currency, setCurrency] = useState('USD');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showEditGroup, setShowEditGroup] = useState(false);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [groups, setGroups] = useState([]);
  const [friends, setFriends] = useState([]);
  const [activities, setActivities] = useState([]);

  // Mock user data
  const user = {
    name: 'Alex Johnson',
    email: 'alex@example.com'
  };

  // Initialize mock data
  useEffect(() => {
    // Mock expenses data
    setExpenses([
      {
        id: 1,
        description: 'Dinner at Italian Restaurant',
        amount: 89.50,
        paidBy: 'You',
        date: '2025-03-15',
        icon: '🍽️',
        group: 'Weekend Trip',
        youOwe: 0,
        youAreOwed: 22.38
      },
      {
        id: 2,
        description: 'Uber to Airport',
        amount: 45.00,
        paidBy: 'Sarah Johnson',
        date: '2025-03-14',
        icon: '🚗',
        group: 'Weekend Trip',
        youOwe: 15.00,
        youAreOwed: 0
      },
      {
        id: 3,
        description: 'Groceries for House',
        amount: 156.78,
        paidBy: 'Mike Chen',
        date: '2025-03-13',
        icon: '🛒',
        group: 'House Expenses',
        youOwe: 31.36,
        youAreOwed: 0
      },
      {
        id: 4,
        description: 'Movie Tickets',
        amount: 32.00,
        paidBy: 'You',
        date: '2025-03-12',
        icon: '🎬',
        group: null,
        youOwe: 0,
        youAreOwed: 16.00
      },
      {
        id: 5,
        description: 'Coffee Shop',
        amount: 18.50,
        paidBy: 'Emma Wilson',
        date: '2025-03-11',
        icon: '☕',
        group: null,
        youOwe: 9.25,
        youAreOwed: 0
      }
    ]);

    // Mock groups data
    setGroups([
      {
        id: 1,
        name: 'Weekend Trip',
        members: ['You', 'Sarah Johnson', 'Mike Chen', 'Emma Wilson'],
        balance: 45.50
      },
      {
        id: 2,
        name: 'House Expenses',
        members: ['You', 'Mike Chen', 'David Brown'],
        balance: -89.25
      },
      {
        id: 3,
        name: 'Work Lunch',
        members: ['You', 'Sarah Johnson', 'Emma Wilson'],
        balance: 0
      },
      {
        id: 4,
        name: 'Vacation Planning',
        members: ['You', 'Sarah Johnson', 'Mike Chen', 'Emma Wilson', 'David Brown'],
        balance: 156.00
      }
    ]);

    // Mock friends data
    setFriends([
      {
        id: 1,
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        balance: 45.50,
        status: 'joined'
      },
      {
        id: 2,
        name: 'Mike Chen',
        email: 'mike@example.com',
        balance: -112.38,
        status: 'joined'
      },
      {
        id: 3,
        name: 'Emma Wilson',
        email: 'emma@example.com',
        balance: 67.25,
        status: 'joined'
      },
      {
        id: 4,
        name: 'David Brown',
        email: 'david@example.com',
        balance: -22.50,
        status: 'invited'
      }
    ]);

    // Mock activity data
    setActivities([
      {
        id: 1,
        type: 'expense',
        description: 'You added "Dinner at Italian Restaurant" in Weekend Trip',
        date: '2025-03-15T19:30:00',
        amount: 89.50
      },
      {
        id: 2,
        type: 'payment',
        description: 'Sarah Johnson paid you $25.00',
        date: '2025-03-15T14:20:00',
        amount: 25.00
      },
      {
        id: 3,
        type: 'expense',
        description: 'Sarah Johnson added "Uber to Airport" in Weekend Trip',
        date: '2025-03-14T16:45:00',
        amount: 45.00
      },
      {
        id: 4,
        type: 'expense',
        description: 'Mike Chen added "Groceries for House" in House Expenses',
        date: '2025-03-13T11:15:00',
        amount: 156.78
      },
      {
        id: 5,
        type: 'payment',
        description: 'You paid Emma Wilson $15.50',
        date: '2025-03-12T20:30:00',
        amount: 15.50
      }
    ]);
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleAddExpense = (expenseData) => {
    const participants = expenseData.participants;
    let youOwe = 0;
    let youAreOwed = 0;

    // Calculate splits based on split type
    if (expenseData.splitType === 'equal') {
      const splitAmount = expenseData.amount / participants.length;
      if (expenseData.paidBy === 'You') {
        youAreOwed = splitAmount * (participants.length - 1);
      } else {
        youOwe = splitAmount;
      }
    } else if (expenseData.splitType === 'percentage') {
      const yourPercentage = expenseData.customSplits['You'] || 0;
      const yourAmount = (expenseData.amount * yourPercentage) / 100;
      if (expenseData.paidBy === 'You') {
        youAreOwed = expenseData.amount - yourAmount;
      } else {
        youOwe = yourAmount;
      }
    } else if (expenseData.splitType === 'exact') {
      const yourAmount = expenseData.customSplits['You'] || 0;
      if (expenseData.paidBy === 'You') {
        youAreOwed = expenseData.amount - yourAmount;
      } else {
        youOwe = yourAmount;
      }
    }

    const newExpense = {
      id: expenses.length + 1,
      ...expenseData,
      youOwe,
      youAreOwed
    };
    setExpenses([newExpense, ...expenses]);
    
    // Add to activity
    const newActivity = {
      id: activities.length + 1,
      type: 'expense',
      description: `You added "${expenseData.description}"${expenseData.group ? ` in ${expenseData.group}` : ''}`,
      date: new Date().toISOString(),
      amount: expenseData.amount
    };
    setActivities([newActivity, ...activities]);
  };

  const handleCreateGroup = (groupData) => {
    const newGroup = {
      id: groups.length + 1,
      ...groupData
    };
    setGroups([newGroup, ...groups]);

    // Add to activity
    const newActivity = {
      id: activities.length + 1,
      type: 'group',
      description: `You created group "${groupData.name}"`,
      date: new Date().toISOString()
    };
    setActivities([newActivity, ...activities]);
  };

  const handleEditGroup = (groupData) => {
    setGroups(groups.map(group => 
      group.id === groupData.id ? groupData : group
    ));

    // Add to activity
    const newActivity = {
      id: activities.length + 1,
      type: 'group',
      description: `You updated group "${groupData.name}"`,
      date: new Date().toISOString()
    };
    setActivities([newActivity, ...activities]);
    
    setEditingGroup(null);
    setShowEditGroup(false);
  };

  const handleAddFriend = (friendData) => {
    const newFriend = {
      id: friends.length + 1,
      ...friendData
    };
    setFriends([newFriend, ...friends]);

    // Add to activity
    const newActivity = {
      id: activities.length + 1,
      type: 'friend',
      description: `You invited ${friendData.name} to join Splitwise`,
      date: new Date().toISOString()
    };
    setActivities([newActivity, ...activities]);
  };

  const handleEditGroupClick = (group) => {
    setEditingGroup(group);
    setShowEditGroup(true);
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <BalanceCard darkMode={darkMode} currency={currency} />
      
      {/* Hero Section */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border overflow-hidden`}>
        <div className="relative h-48 bg-gradient-to-r from-green-500 to-teal-600">
          <img 
            src="https://images.unsplash.com/photo-1593079323074-f1d77349c998" 
            alt="Expense sharing concept"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <h2 className="text-2xl font-bold mb-2">Split expenses with ease</h2>
              <p className="text-lg opacity-90">Keep track of shared expenses and balances</p>
            </div>
          </div>
        </div>
      </div>

      {/* How Friends Login Info */}
      <div className={`${darkMode ? 'bg-blue-900 border-blue-700' : 'bg-blue-50 border-blue-200'} rounded-xl border p-4`}>
        <h3 className={`font-semibold mb-2 ${darkMode ? 'text-blue-200' : 'text-blue-800'}`}>
          🤝 How Friends Join Splitwise
        </h3>
        <div className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-700'} space-y-2`}>
          <p><strong>1. Invitation:</strong> When you add a friend, they receive an email invitation</p>
          <p><strong>2. Account Creation:</strong> They click the link and create their Splitwise account</p>
          <p><strong>3. Instant Access:</strong> Once joined, they can see shared expenses and add their own</p>
          <p><strong>4. Real-time Sync:</strong> All balances and expenses sync automatically across accounts</p>
        </div>
        <button
          onClick={() => setShowLogin(true)}
          className={`mt-3 px-4 py-2 rounded-lg text-sm font-medium ${
            darkMode 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          See Login Experience
        </button>
      </div>

      {/* Recent Expenses */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Recent Expenses</h2>
          <button
            onClick={() => setActiveTab('expenses')}
            className="text-green-600 hover:text-green-700 font-medium text-sm"
          >
            View all
          </button>
        </div>
        <div className="space-y-3">
          {expenses.slice(0, 3).map(expense => (
            <ExpenseCard key={expense.id} expense={expense} darkMode={darkMode} currency={currency} />
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-4 text-center`}>
          <div className="text-2xl font-bold text-green-600">{groups.length}</div>
          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Active Groups</div>
        </div>
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-4 text-center`}>
          <div className="text-2xl font-bold text-blue-600">{friends.length}</div>
          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Friends</div>
        </div>
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-4 text-center`}>
          <div className="text-2xl font-bold text-orange-600">{expenses.length}</div>
          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Expenses</div>
        </div>
      </div>
    </div>
  );

  const renderExpenses = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>All Expenses</h2>
        <button
          onClick={() => setShowAddExpense(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
        >
          <span>+</span>
          <span>Add Expense</span>
        </button>
      </div>

      {/* Expense Management Visual */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border overflow-hidden`}>
        <div className="relative h-32 bg-gradient-to-r from-blue-500 to-purple-600">
          <img 
            src="https://images.pexels.com/photos/6289058/pexels-photo-6289058.jpeg" 
            alt="Financial management"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <h3 className="text-lg font-semibold">Expense Management</h3>
              <p className="text-sm opacity-90">Track and split your expenses efficiently</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {expenses.map(expense => (
          <ExpenseCard key={expense.id} expense={expense} darkMode={darkMode} currency={currency} />
        ))}
      </div>
    </div>
  );

  const renderGroups = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Groups</h2>
        <button 
          onClick={() => setShowCreateGroup(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Create Group
        </button>
      </div>

      <div className="space-y-3">
        {groups.map(group => (
          <GroupCard 
            key={group.id} 
            group={group} 
            darkMode={darkMode} 
            currency={currency}
            onEditGroup={handleEditGroupClick}
          />
        ))}
      </div>
    </div>
  );

  const renderFriends = () => (
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

  const renderActivity = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Recent Activity</h2>
      </div>

      {/* Digital Payment Visual */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border overflow-hidden`}>
        <div className="relative h-32 bg-gradient-to-r from-orange-500 to-red-600">
          <img 
            src="https://images.pexels.com/photos/5980887/pexels-photo-5980887.jpeg" 
            alt="Digital payments"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <h3 className="text-lg font-semibold">Payment Tracking</h3>
              <p className="text-sm opacity-90">Monitor all your transactions and settlements</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {activities.map(activity => (
          <ActivityItem key={activity.id} activity={activity} darkMode={darkMode} currency={currency} />
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'expenses':
        return renderExpenses();
      case 'groups':
        return renderGroups();
      case 'friends':
        return renderFriends();
      case 'activity':
        return renderActivity();
      default:
        return renderDashboard();
    }
  };

  return (
    <BrowserRouter>
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors`}>
        <Header 
          user={user} 
          darkMode={darkMode} 
          toggleDarkMode={toggleDarkMode}
          currency={currency}
          setCurrency={setCurrency}
          onProfileClick={() => setShowLogin(true)}
        />
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} darkMode={darkMode} />
        
        <main className="max-w-4xl mx-auto px-4 py-6">
          {renderContent()}
        </main>

        {/* Floating Add Button */}
        <button
          onClick={() => setShowAddExpense(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-colors flex items-center justify-center text-xl font-bold hover:scale-105 transform z-40"
        >
          +
        </button>

        {/* Modals */}
        <AddExpenseModal
          isOpen={showAddExpense}
          onClose={() => setShowAddExpense(false)}
          onSubmit={handleAddExpense}
          darkMode={darkMode}
          friends={friends}
          currency={currency}
        />

        <CreateGroupModal
          isOpen={showCreateGroup}
          onClose={() => setShowCreateGroup(false)}
          onSubmit={handleCreateGroup}
          darkMode={darkMode}
          friends={friends}
        />

        <EditGroupModal
          isOpen={showEditGroup}
          onClose={() => {
            setShowEditGroup(false);
            setEditingGroup(null);
          }}
          onSubmit={handleEditGroup}
          darkMode={darkMode}
          group={editingGroup}
          friends={friends}
        />

        <AddFriendModal
          isOpen={showAddFriend}
          onClose={() => setShowAddFriend(false)}
          onSubmit={handleAddFriend}
          darkMode={darkMode}
        />

        <LoginModal
          isOpen={showLogin}
          onClose={() => setShowLogin(false)}
          darkMode={darkMode}
        />
      </div>
    </BrowserRouter>
  );
}

export default App;