import React, { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import './App.css';

// Hooks
import { useAuth, useData } from './hooks';

// Layout Components
import { Header, Navigation } from './components/layout';

// Page Components
import { Dashboard, Expenses, Groups, Friends, Activity } from './pages';

// Modal Components
import {
  AddExpenseModal,
  CreateGroupModal,
  EditGroupModal,
  AddFriendModal,
  LoginModal
} from './components/modals';

// API functions
import { groupAPI, expenseAPI } from './api';

function App() {
  // UI State
  const [darkMode, setDarkMode] = useState(false);
  const [currency, setCurrency] = useState('USD');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showEditGroup, setShowEditGroup] = useState(false);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [selectedGroupForExpense, setSelectedGroupForExpense] = useState(null);
  const [selectedGroupView, setSelectedGroupView] = useState(null);

  // Custom Hooks
  const { user, loading: authLoading, login, logout, isAuthenticated } = useAuth();
  const {
    expenses,
    groups,
    friends,
    activities,
    loading: dataLoading,
    error: dataError,
    loadAllData
  } = useData(user, currency);

  const loading = authLoading || dataLoading;

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  /**
   * Handle adding a new expense via API
   */
  const handleAddExpense = async (expenseData) => {
    try {
      // Find the group by name to get ID
      const group = groups.find(g => g.name === expenseData.groupName);
      if (!group) {
        alert('Group not found');
        return;
      }

      // Get payer user ID
      const payerId = expenseData.paidBy === 'You' ? user.id :
        group.members.find(m => m.name === expenseData.paidBy)?.id;

      if (!payerId) {
        alert('Payer not found');
        return;
      }

      // Build splits object based on split type
      const splits = {};

      if (expenseData.splitType === 'equal') {
        // For equal split, all participants get equal share
        expenseData.participants.forEach(participantName => {
          const member = group.members.find(m => m.name === participantName || (participantName === 'You' && m.id === user.id));
          if (member) {
            splits[member.id] = expenseData.amount / expenseData.participants.length;
          }
        });
      } else if (expenseData.splitType === 'exact') {
        // For exact split, use custom amounts
        Object.entries(expenseData.customSplits).forEach(([name, amount]) => {
          const member = group.members.find(m => m.name === name || (name === 'You' && m.id === user.id));
          if (member) {
            splits[member.id] = amount;
          }
        });
      } else if (expenseData.splitType === 'percentage') {
        // For percentage split, calculate amounts from percentages
        Object.entries(expenseData.customSplits).forEach(([name, percentage]) => {
          const member = group.members.find(m => m.name === name || (name === 'You' && m.id === user.id));
          if (member) {
            splits[member.id] = (expenseData.amount * percentage) / 100;
          }
        });
      }

      // Create expense via API
      await expenseAPI.createExpense({
        description: expenseData.description,
        amount: expenseData.amount,
        groupId: group.id,
        paidByUserId: payerId,
        splitType: expenseData.splitType,
        splits: splits,
      });

      // Reload data
      await loadAllData();

      alert('Expense added successfully!');
    } catch (error) {
      console.error('Failed to add expense:', error);
      alert('Failed to add expense. Please try again.');
    }
  };

  /**
   * Handle creating a new group via API
   */
  const handleCreateGroup = async (groupData) => {
    try {
      // Get member IDs from names
      const memberIds = [user.id]; // Always include current user

      groupData.members.forEach(memberName => {
        if (memberName !== 'You') {
          const friend = friends.find(f => f.name === memberName);
          if (friend) {
            memberIds.push(friend.id);
          }
        }
      });

      // Create group via API
      await groupAPI.createGroup(groupData.name, memberIds);

      // Reload data
      await loadAllData();

      alert('Group created successfully!');
    } catch (error) {
      console.error('Failed to create group:', error);
      alert('Failed to create group. Please try again.');
    }
  };

  /**
   * Handle editing a group (currently just closes modal - API endpoint not implemented yet)
   */
  const handleEditGroup = (groupData) => {
    // TODO: Implement group edit API endpoint
    alert('Group editing will be available soon!');
    setEditingGroup(null);
    setShowEditGroup(false);
  };

  /**
   * Handle adding a friend (currently not needed as friends come from group members)
   */
  const handleAddFriend = (friendData) => {
    // Friends are automatically added when they join groups
    // This is more of a "register new user" feature
    alert('Friends are automatically added when you create groups together!');
  };

  const handleEditGroupClick = (group) => {
    setEditingGroup(group);
    setShowEditGroup(true);
  };

  const handleAddExpenseToGroup = (group) => {
    setSelectedGroupForExpense(group);
    setShowAddExpense(true);
  };

  const handleViewGroupDetails = (group) => {
    setSelectedGroupView(group);
  };

  const handleBackFromGroupDetails = () => {
    setSelectedGroupView(null);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            darkMode={darkMode}
            currency={currency}
            groups={groups}
            expenses={expenses}
            setShowLogin={setShowLogin}
            setActiveTab={setActiveTab}
          />
        );
      case 'expenses':
        return (
          <Expenses
            darkMode={darkMode}
            expenses={expenses}
            currency={currency}
            setShowAddExpense={setShowAddExpense}
          />
        );
      case 'groups':
        return (
          <Groups
            darkMode={darkMode}
            currency={currency}
            groups={groups}
            expenses={expenses}
            selectedGroupView={selectedGroupView}
            setShowCreateGroup={setShowCreateGroup}
            handleEditGroupClick={handleEditGroupClick}
            handleAddExpenseToGroup={handleAddExpenseToGroup}
            handleViewGroupDetails={handleViewGroupDetails}
            handleBackFromGroupDetails={handleBackFromGroupDetails}
          />
        );
      case 'friends':
        return (
          <Friends
            darkMode={darkMode}
            currency={currency}
            friends={friends}
            setShowAddFriend={setShowAddFriend}
          />
        );
      case 'activity':
        return (
          <Activity
            darkMode={darkMode}
            currency={currency}
            activities={activities}
          />
        );
      default:
        return (
          <Dashboard
            darkMode={darkMode}
            currency={currency}
            groups={groups}
            expenses={expenses}
            setShowLogin={setShowLogin}
            setActiveTab={setActiveTab}
          />
        );
    }
  };

  // Show login modal if not authenticated
  if (!user && !isAuthenticated) {
    return (
      <BrowserRouter>
        <div className={`min-h-screen ${darkMode ? 'bg-slate-900' : 'bg-slate-50'} transition-colors flex items-center justify-center`}>
          <LoginModal
            isOpen={true}
            onClose={() => {}} // Don't allow closing without login
            darkMode={darkMode}
            onLogin={login}
          />
        </div>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <div className={`min-h-screen ${darkMode ? 'bg-slate-900' : 'bg-slate-50'} transition-colors`}>
        <Header
          user={user}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          currency={currency}
          setCurrency={setCurrency}
          onProfileClick={() => setShowLogin(true)}
        />
        <Navigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          darkMode={darkMode}
          groupsCount={groups.length}
          friendsCount={friends.length}
        />

        <main className="max-w-4xl mx-auto px-4 py-6">
          {renderContent()}
        </main>

        {/* Floating Add Button */}
        <button
          onClick={() => setShowAddExpense(true)}
          className="fixed bottom-6 right-6 w-16 h-16 gradient-teal text-white rounded-2xl shadow-2xl hover:shadow-3xl transition-all flex items-center justify-center text-3xl font-bold hover:scale-110 transform z-40 float-animation"
        >
          +
        </button>

        {/* Modals */}
        <AddExpenseModal
          isOpen={showAddExpense}
          onClose={() => {
            setShowAddExpense(false);
            setSelectedGroupForExpense(null);
          }}
          onSubmit={handleAddExpense}
          darkMode={darkMode}
          friends={friends}
          currency={currency}
          groups={groups}
          selectedGroup={selectedGroupForExpense}
        />

        <CreateGroupModal
          isOpen={showCreateGroup}
          onClose={() => setShowCreateGroup(false)}
          onSubmit={handleCreateGroup}
          darkMode={darkMode}
          friends={friends}
          defaultCurrency={currency}
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
          onLogin={login}
        />
      </div>
    </BrowserRouter>
  );
}

export default App;
