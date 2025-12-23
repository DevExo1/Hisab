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
import apiClient from '../../api/client';

export default function GroupsScreen({ navigation }) {
  const { isDarkMode } = useTheme();
  const { groups, friends, isLoading, refreshData } = useData();
  const theme = isDarkMode ? COLORS.dark : COLORS.light;

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const handleCreateGroup = async (groupData) => {
    try {
      await apiClient.createGroup(groupData);
      await refreshData();
    } catch (error) {
      throw error;
    }
  };

  const handleEditGroup = (group) => {
    setSelectedGroup(group);
    setShowEditModal(true);
  };

  const handleUpdateGroup = async (groupData) => {
    try {
      await apiClient.updateGroup(groupData.id, groupData);
      await refreshData();
    } catch (error) {
      throw error;
    }
  };

  const handleViewGroupDetails = (group) => {
    navigation.navigate('GroupDetails', { groupId: group.id });
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
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <View>
          <Text style={[styles.title, { color: theme.text }]}>Groups</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {groups.length} {groups.length === 1 ? 'group' : 'groups'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryDark]}
            style={styles.createButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.createButtonText}>+ Create Group</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

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
              onPress={() => setShowCreateModal(true)}
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

      {/* Create Group Modal */}
      <CreateGroupModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateGroup}
        friends={friends}
        isDarkMode={isDarkMode}
      />

      {/* Edit Group Modal */}
      <EditGroupModal
        visible={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedGroup(null);
        }}
        onSubmit={handleUpdateGroup}
        group={selectedGroup}
        friends={friends}
        isDarkMode={isDarkMode}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    ...SHADOWS.small,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
  },
  createButton: {
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  createButtonGradient: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
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
