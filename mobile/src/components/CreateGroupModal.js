/**
 * Create Group Modal Component
 * Modal for creating a new group with members
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  Pressable,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { CURRENCIES } from '../utils/currency';

export default function CreateGroupModal({ visible, onClose, onSubmit, friends = [], isDarkMode = false }) {
  const theme = isDarkMode ? COLORS.dark : COLORS.light;
  
  const [groupName, setGroupName] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);

  const handleSubmit = async () => {
    if (!groupName.trim()) {
      setError('Please enter a group name');
      return;
    }

    if (selectedFriends.length === 0) {
      setError('Please select at least one friend');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await onSubmit({
        name: groupName.trim(),
        currency: currency,
        member_ids: selectedFriends.map(f => f.id),
      });
      handleClose();
    } catch (err) {
      setError(err.message || 'Failed to create group');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setGroupName('');
    setCurrency('USD');
    setSelectedFriends([]);
    setError('');
    onClose();
  };

  const toggleFriend = (friend) => {
    if (selectedFriends.find(f => f.id === friend.id)) {
      setSelectedFriends(selectedFriends.filter(f => f.id !== friend.id));
    } else {
      setSelectedFriends([...selectedFriends, friend]);
    }
  };

  const selectedCurrency = CURRENCIES.find(c => c.code === currency);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <Pressable style={styles.innerWrapper} onPress={(e) => e.stopPropagation()}>
            <View style={[styles.modalContent, { backgroundColor: theme.surface }, SHADOWS.large]}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={[styles.title, { color: theme.text }]}>Create Group</Text>
                <TouchableOpacity
                  style={[styles.closeButton, { backgroundColor: theme.surfaceSecondary }]}
                  onPress={handleClose}
                >
                  <Text style={[styles.closeButtonText, { color: theme.text }]}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContainer}
                keyboardShouldPersistTaps="handled"
              >
                {/* Error Message */}
                {error ? (
                  <View style={[styles.errorBox, { backgroundColor: COLORS.error + '20', borderColor: COLORS.error }]}>
                    <Text style={[styles.errorText, { color: COLORS.error }]}>⚠️ {error}</Text>
                  </View>
                ) : null}

                {/* Group Name Input */}
                <View style={styles.formSection}>
                  <Text style={[styles.label, { color: theme.text }]}>Group Name</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                    value={groupName}
                    onChangeText={(text) => {
                      setGroupName(text);
                      setError('');
                    }}
                    placeholder="e.g., Weekend Trip, Apartment, Family"
                    placeholderTextColor={theme.textTertiary}
                    editable={!isLoading}
                  />
                </View>

                {/* Currency Selector */}
                <View style={styles.formSection}>
                  <Text style={[styles.label, { color: theme.text }]}>Currency</Text>
                  <TouchableOpacity
                    style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border }]}
                    onPress={() => setShowCurrencyPicker(!showCurrencyPicker)}
                    disabled={isLoading}
                  >
                    <Text style={[styles.inputText, { color: theme.text }]}>
                      {selectedCurrency.code} - {selectedCurrency.symbol} ({selectedCurrency.name})
                    </Text>
                  </TouchableOpacity>
                  
                  {showCurrencyPicker && (
                    <View style={[styles.currencyList, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                      <ScrollView style={styles.currencyScroll} nestedScrollEnabled>
                        {CURRENCIES.map((curr) => (
                          <TouchableOpacity
                            key={curr.code}
                            style={[
                              styles.currencyItem,
                              currency === curr.code && { backgroundColor: theme.surfaceSecondary }
                            ]}
                            onPress={() => {
                              setCurrency(curr.code);
                              setShowCurrencyPicker(false);
                            }}
                          >
                            <Text style={[styles.currencyText, { color: theme.text }]}>
                              {curr.code} - {curr.symbol} ({curr.name})
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>

                {/* Members Selection */}
                <View style={styles.formSection}>
                  <Text style={[styles.label, { color: theme.text }]}>
                    Select Members ({selectedFriends.length} selected)
                  </Text>
                  <View style={[styles.membersList, { backgroundColor: theme.background, borderColor: theme.border }]}>
                    {friends.length === 0 ? (
                      <View style={styles.emptyFriends}>
                        <Text style={[styles.emptyFriendsText, { color: theme.textSecondary }]}>
                          No friends available. Add friends first to create a group.
                        </Text>
                      </View>
                    ) : (
                      friends.map((friend) => {
                        const isSelected = selectedFriends.find(f => f.id === friend.id);
                        return (
                          <TouchableOpacity
                            key={friend.id}
                            style={[
                              styles.memberItem,
                              { backgroundColor: theme.surfaceSecondary },
                              isSelected && { borderColor: COLORS.primary, borderWidth: 2 }
                            ]}
                            onPress={() => toggleFriend(friend)}
                            disabled={isLoading}
                          >
                            <View style={styles.memberInfo}>
                              <LinearGradient
                                colors={isSelected ? [COLORS.primary, COLORS.primaryDark] : [theme.textTertiary, theme.textSecondary]}
                                style={styles.memberAvatar}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                              >
                                <Text style={styles.memberAvatarText}>{friend.name.charAt(0).toUpperCase()}</Text>
                              </LinearGradient>
                              <View style={styles.memberDetails}>
                                <Text style={[styles.memberName, { color: theme.text }]}>{friend.name}</Text>
                                <Text style={[styles.memberEmail, { color: theme.textSecondary }]}>{friend.email}</Text>
                              </View>
                            </View>
                            <View style={[
                              styles.checkbox,
                              { borderColor: theme.border },
                              isSelected && { backgroundColor: COLORS.primary, borderColor: COLORS.primary }
                            ]}>
                              {isSelected && <Text style={styles.checkmark}>✓</Text>}
                            </View>
                          </TouchableOpacity>
                        );
                      })
                    )}
                  </View>
                </View>
              </ScrollView>

              {/* Buttons */}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.cancelButton, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}
                  onPress={handleClose}
                  disabled={isLoading}
                >
                  <Text style={[styles.cancelButtonText, { color: theme.text }]} numberOfLines={1}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.submitButton, isLoading && styles.disabledButton]}
                  onPress={handleSubmit}
                  disabled={isLoading}
                >
                  <LinearGradient
                    colors={isLoading ? [COLORS.primary + '80', COLORS.primaryDark + '80'] : [COLORS.primary, COLORS.primaryDark]}
                    style={styles.submitButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.submitButtonText} numberOfLines={1}>Save</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    paddingTop: SPACING.sm,
  },
  keyboardView: {
    width: '100%',
    flex: 1,
  },
  innerWrapper: {
    flex: 1,
  },
  modalContent: {
    width: '100%',
    flex: 1,
    borderRadius: 0,
    padding: SPACING.lg,
    maxHeight: '100%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.medium,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: SPACING.xl * 2,
  },
  errorBox: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    marginBottom: SPACING.md,
  },
  errorText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
  },
  formSection: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    marginBottom: SPACING.xs,
  },
  input: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    fontSize: FONT_SIZES.md,
    justifyContent: 'center',
  },
  inputText: {
    fontSize: FONT_SIZES.md,
  },
  currencyList: {
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.xs,
    maxHeight: 200,
  },
  currencyScroll: {
    maxHeight: 200,
  },
  currencyItem: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.dark.border,
  },
  currencyText: {
    fontSize: FONT_SIZES.sm,
  },
  membersList: {
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    padding: SPACING.xs,
    maxHeight: 300,
  },
  emptyFriends: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  emptyFriendsText: {
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.xs,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  memberAvatar: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  memberAvatarText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: '#FFFFFF',
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  memberEmail: {
    fontSize: FONT_SIZES.xs,
    marginTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: FONT_WEIGHTS.bold,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  submitButton: {
    flex: 1,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  submitButtonGradient: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  submitButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
    color: '#FFFFFF',
  },
  disabledButton: {
    opacity: 0.6,
  },
});
