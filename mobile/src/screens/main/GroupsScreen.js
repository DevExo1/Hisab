/**
 * Groups Screen
 * List of groups with create and edit functionality
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useData } from '../../contexts/DataContext';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import GroupCard from '../../components/GroupCard';
import CreateGroupModal from '../../components/CreateGroupModal';
import EditGroupModal from '../../components/EditGroupModal';
import SelectMembersModal from '../../components/SelectMembersModal';
import apiClient from '../../api/client';

export default function GroupsScreen({ navigation }) {
  const { isDarkMode } = useTheme();
  const { groups, friends, isLoading, refreshData } = useData();
  const theme = isDarkMode ? COLORS.dark : COLORS.light;

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSelectMembersModal, setShowSelectMembersModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  
  // Store CreateGroup form state to persist when switching to SelectMembers
  const [createGroupFormState, setCreateGroupFormState] = useState({
    groupName: '',
    currency: 'USD',
  });
  
  // Store EditGroup form state and members for modal switching
  const [editGroupFormState, setEditGroupFormState] = useState({
    groupName: '',
    currency: 'USD',
  });
  const [editGroupMembers, setEditGroupMembers] = useState([]);
  const [isEditingGroup, setIsEditingGroup] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const handleCreateGroup = async (groupData) => {
    try {
      await apiClient.createGroup(groupData);
      await refreshData();
      // Reset form state after successful creation
      setCreateGroupFormState({ groupName: '', currency: 'USD' });
      setSelectedMembers([]);
    } catch (error) {
      throw error;
    }
  };

  const handleEditGroup = (group) => {
    setSelectedGroup(group);
    
    // Initialize edit group members from group data
    const memberIds = group.members
      ?.filter(m => m.name !== 'You')
      .map(m => m.id) || [];
    const preselected = friends.filter(f => memberIds.includes(f.id));
    setEditGroupMembers(preselected);
    
    // Initialize form state
    setEditGroupFormState({
      groupName: group.name || '',
      currency: group.currency || 'USD',
    });
    
    setShowEditModal(true);
  };

  const handleUpdateGroup = async (groupData) => {
    try {
      // Only check if members are being REMOVED (not added)
      const selectedGroup = groups.find(g => g.id === groupData.id);
      if (selectedGroup) {
        const currentMemberIds = selectedGroup.members?.map(m => m.user_id || m.id) || [];
        const newMemberIds = groupData.member_ids || [];
        const removedMemberIds = currentMemberIds.filter(id => !newMemberIds.includes(id));
        
        // Block all member removal if group has any activity (expenses/settlements)
        if (removedMemberIds.length > 0) {
          throw new Error('Cannot remove members from groups with existing transactions. Members can only be added. Please view the group details for more information.');
        }
      }
      
      await apiClient.updateGroup(groupData.id, groupData);
      await refreshData();
    } catch (error) {
      throw error;
    }
  };

  const handleViewGroupDetails = (group) => {
    navigation.navigate('GroupDetails', { groupId: group.id });
  };

  const handleOpenSelectMembers = (formState) => {
    // Save the current form state before switching modals
    setCreateGroupFormState(formState);
    // Hide CreateGroup and show SelectMembers
    setShowCreateModal(false);
    setShowSelectMembersModal(true);
  };

  const handleMembersSelected = (members) => {
    if (isEditingGroup) {
      handleEditMembersSelected(members);
      setIsEditingGroup(false);
    } else {
      setSelectedMembers(members);
      // Close SelectMembers and reopen CreateGroup
      setShowSelectMembersModal(false);
      setShowCreateModal(true);
    }
  };

  const handleCloseSelectMembers = () => {
    if (isEditingGroup) {
      handleCloseSelectMembersForEdit();
      setIsEditingGroup(false);
    } else {
      // Just go back to CreateGroup without changing selections
      setShowSelectMembersModal(false);
      setShowCreateModal(true);
    }
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    // Reset everything when fully closing
    setCreateGroupFormState({ groupName: '', currency: 'USD' });
    setSelectedMembers([]);
  };

  const handleOpenSelectMembersForEdit = (formState) => {
    // Save the current edit form state before switching modals
    setEditGroupFormState(formState);
    setIsEditingGroup(true);
    // Hide EditGroup and show SelectMembers
    setShowEditModal(false);
    setShowSelectMembersModal(true);
  };

  const handleEditMembersSelected = (members) => {
    setEditGroupMembers(members);
    // Close SelectMembers and reopen EditGroup
    setShowSelectMembersModal(false);
    setShowEditModal(true);
  };

  const handleCloseSelectMembersForEdit = () => {
    // Just go back to EditGroup without changing selections
    setShowSelectMembersModal(false);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedGroup(null);
    setEditGroupMembers([]);
    setEditGroupFormState({ groupName: '', currency: 'USD' });
  };

  // Show loading state on first load
  if (isLoading && !refreshing && groups.length === 0) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
          Loading groups...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Groups List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
      >
        {groups.length > 0 ? (
          groups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              isDarkMode={isDarkMode}
              currency={group.currency || 'USD'}
              onPress={() => handleViewGroupDetails(group)}
              onEdit={() => handleEditGroup(group)}
            />
          ))
        ) : (
          <View style={[styles.emptyState, { backgroundColor: theme.surface }]}>
            <Ionicons name="people-outline" size={64} color={theme.textTertiary} style={styles.emptyStateIcon} />
            <Text style={[styles.emptyStateTitle, { color: theme.text }]}>No groups yet</Text>
            <Text style={[styles.emptyStateText, { color: theme.textSecondary }]}>
              Create a group to start tracking shared expenses with friends
            </Text>
            <TouchableOpacity
              style={styles.emptyStateButton}
              onPress={() => {
                setSelectedMembers([]);
                setCreateGroupFormState({ groupName: '', currency: 'USD' });
                setShowCreateModal(true);
              }}
            >
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryDark]}
                style={styles.emptyStateButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.emptyStateButtonText}>+ Create Your First Group</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          setSelectedMembers([]);
          setCreateGroupFormState({ groupName: '', currency: 'USD' });
          setShowCreateModal(true);
        }}
      >
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryDark]}
          style={styles.fabGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.fabText}>+</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Create Group Modal */}
      <CreateGroupModal
        visible={showCreateModal}
        onClose={handleCloseCreateModal}
        onSubmit={handleCreateGroup}
        friends={friends}
        isDarkMode={isDarkMode}
        selectedMembers={selectedMembers}
        onOpenSelectMembers={handleOpenSelectMembers}
        initialFormState={createGroupFormState}
      />

      {/* Edit Group Modal */}
      <EditGroupModal
        visible={showEditModal}
        onClose={handleCloseEditModal}
        onSubmit={handleUpdateGroup}
        group={selectedGroup}
        friends={friends}
        isDarkMode={isDarkMode}
        selectedMembers={editGroupMembers}
        onOpenSelectMembers={handleOpenSelectMembersForEdit}
        initialFormState={editGroupFormState}
      />

      {/* Select Members Modal */}
      <SelectMembersModal
        visible={showSelectMembersModal}
        onClose={handleCloseSelectMembers}
        onDone={handleMembersSelected}
        friends={friends}
        initialSelectedFriends={isEditingGroup ? editGroupMembers : selectedMembers}
        isDarkMode={isDarkMode}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING.xl,
    borderRadius: BORDER_RADIUS.full,
    elevation: 8,
    ...SHADOWS.large,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabText: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: FONT_WEIGHTS.bold,
    marginTop: -2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.md,
  },
title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    marginBottom: 2,
  },
createButton: {
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
createButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
  },
  emptyState: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xxl,
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  emptyStateIcon: {
    marginBottom: SPACING.md,
  },
  emptyStateTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    marginBottom: SPACING.sm,
  },
  emptyStateText: {
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  emptyStateButton: {
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  emptyStateButtonGradient: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  emptyStateButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
    color: '#FFFFFF',
  },
});
