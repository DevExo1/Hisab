import React from 'react';
import { GroupCard } from '../components/cards';
import { GroupDetails } from './GroupDetails';

export const Groups = ({
  darkMode,
  currency,
  groups,
  expenses,
  selectedGroupView,
  setShowCreateGroup,
  handleEditGroupClick,
  handleAddExpenseToGroup,
  handleViewGroupDetails,
  handleBackFromGroupDetails,
  handleOpenSettlement,
  user,
  groupDetailsRefreshTrigger,
  handleRefreshAll
}) => {
  // If a group is selected, show group details
  if (selectedGroupView) {
    return (
      <GroupDetails
        selectedGroupView={selectedGroupView}
        darkMode={darkMode}
        currency={currency}
        expenses={expenses}
        handleBackFromGroupDetails={handleBackFromGroupDetails}
        handleEditGroupClick={handleEditGroupClick}
        handleAddExpenseToGroup={handleAddExpenseToGroup}
        handleOpenSettlement={handleOpenSettlement}
        user={user}
        onExpenseAdded={groupDetailsRefreshTrigger}
        handleRefreshAll={handleRefreshAll}
      />
    );
  }

  // Otherwise show groups list
  return (
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
            onAddExpense={handleAddExpenseToGroup}
            onViewDetails={handleViewGroupDetails}
          />
        ))}
      </div>
    </div>
  );
};
