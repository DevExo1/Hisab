import React, { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import './App.css';

// Hooks
import { useAuth, useData } from './hooks';

// Layout Components
import { Header, Navigation } from './components/layout';

// Page Components
import { Dashboard, Expenses, Groups, Friends, Activity, SettlementView } from './pages';

// Modal Components
import {
  AddExpenseModal,
  CreateGroupModal,
  EditGroupModal,
  AddFriendModal,
  LoginModal
} from './components/modals';
import { ProfileSettingsModal } from './components/modals/ProfileSettingsModal';

// API functions
import { groupAPI, expenseAPI, friendsAPI, userAPI } from './api';

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
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [selectedGroupForExpense, setSelectedGroupForExpense] = useState(null);
  const [selectedGroupView, setSelectedGroupView] = useState(null);
  const [showSettlementView, setShowSettlementView] = useState(false);

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
        // For equal split, backend expects user IDs with any value (backend calculates amounts)
        expenseData.participants.forEach(participantName => {
          const member = group.members.find(m => m.name === participantName || (participantName === 'You' && m.id === user.id));
          if (member) {
            splits[member.id] = 0; // Value doesn't matter for equal split
          }
        });
      } else if (expenseData.splitType === 'exact') {
        // For exact split, send the exact amounts
        Object.entries(expenseData.customSplits).forEach(([name, amount]) => {
          const member = group.members.find(m => m.name === name || (name === 'You' && m.id === user.id));
          if (member) {
            splits[member.id] = amount;
          }
        });
      } else if (expenseData.splitType === 'percentage') {
        // For percentage split, send the PERCENTAGE values (backend calculates amounts)
        Object.entries(expenseData.customSplits).forEach(([name, percentage]) => {
          const member = group.members.find(m => m.name === name || (name === 'You' && m.id === user.id));
          if (member) {
            splits[member.id] = percentage; // Send percentage, not calculated amount
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

      // Create group via API with currency
      await groupAPI.createGroup(groupData.name, memberIds, groupData.currency || 'USD');

      // Reload data
      await loadAllData();

      alert('Group created successfully!');
    } catch (error) {
      console.error('Failed to create group:', error);
      alert('Failed to create group. Please try again.');
    }
  };

  /**
   * Handle editing a group via API
   */
  const handleEditGroup = async (groupData) => {
    try {
      console.log('handleEditGroup called with:', groupData);
      console.log('Available friends:', friends);
      console.log('Current user:', user);

      // Prefer explicit member_ids if provided by the modal (more reliable than name matching)
      let memberIds = null;
      if (Array.isArray(groupData.member_ids) && groupData.member_ids.length > 0) {
        memberIds = [...new Set(groupData.member_ids.map((id) => parseInt(id, 10)).filter((n) => Number.isFinite(n)))];
      }

      // Backwards-compat: derive member IDs from names
      if (!memberIds) {
        memberIds = [user.id]; // Always include current user

        (groupData.members || []).forEach(memberName => {
          if (memberName !== 'You') {
            const friend = friends.find(f => f.name === memberName);
            if (friend) {
              memberIds.push(friend.id);
            } else {
              console.warn(`Friend not found: ${memberName}`);
            }
          }
        });
      }

      console.log('Member IDs to send:', memberIds);

      // Update group via API with currency
      const response = await groupAPI.updateGroup(groupData.id, groupData.name, memberIds, groupData.currency || 'USD');
      console.log('Update response:', response);

      // Reload data
      await loadAllData();

      alert('Group updated successfully!');
      setEditingGroup(null);
      setShowEditGroup(false);
    } catch (error) {
      console.error('Failed to update group:', error);
      console.error('Error details:', error.response?.data || error.message);
      alert(`Failed to update group: ${error.response?.data?.detail || error.message}`);
    }
  };

  /**
   * Handle adding a friend (currently not needed as friends come from group members)
   */
  const handleAddFriend = async (friendData) => {
    try {
      const result = await friendsAPI.addFriend(friendData.email);
      alert(`Friend added successfully! ${result.friend.name} is now your friend.`);
      await loadAllData();
    } catch (error) {
      console.error('Failed to add friend:', error);
      // Normalize error message for modal
      const message = error?.response?.data?.detail || error?.message || 'Failed to add friend';
      throw new Error(message);
    }
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

  const handleOpenSettlement = (group) => {
    setSelectedGroupView(group);
    setShowSettlementView(true);
  };

  const handleBackFromSettlement = () => {
    setShowSettlementView(false);
    // Stay on the group, just go back to details
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      setActiveTab('dashboard');
    }
  };

  const handleProfileSettings = () => {
    setShowProfileSettings(true);
  };

  const handleUpdateProfile = async (updateData) => {
    try {
      await userAPI.updateProfile(updateData);
      alert('Profile updated successfully!');
      await loadAllData();
    } catch (error) {
      console.error('Failed to update profile:', error);
      const message = error?.response?.data?.detail || error?.message || 'Failed to update profile';
      throw new Error(message);
    }
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
        // Show SettlementView if active, otherwise show Groups page
        if (showSettlementView && selectedGroupView) {
          return (
            <SettlementView
              darkMode={darkMode}
              currency={currency}
              selectedGroup={selectedGroupView}
              onBack={handleBackFromSettlement}
              user={user}
            />
          );
        }
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
            handleOpenSettlement={handleOpenSettlement}
            user={user}
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
          onProfileClick={handleProfileSettings}
          onLogout={handleLogout}
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
          user={user}
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
          currentUser={user}
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

        <ProfileSettingsModal
          isOpen={showProfileSettings}
          onClose={() => setShowProfileSettings(false)}
          onSubmit={handleUpdateProfile}
          darkMode={darkMode}
          user={user}
        />
      </div>
    </BrowserRouter>
  );
}

export default App;
