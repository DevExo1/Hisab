/**
 * Create Group Modal Component
 * Modal for creating a new group with members
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { CURRENCIES } from '../utils/currency';

export default function CreateGroupModal({ 
  visible, 
  onClose, 
  onSubmit, 
  friends = [], 
  isDarkMode = false,
  selectedMembers = [],
  onOpenSelectMembers,
  initialFormState = { groupName: '', currency: 'USD' }
}) {
  const theme = isDarkMode ? COLORS.dark : COLORS.light;
  const insets = useSafeAreaInsets();
  
  const [groupName, setGroupName] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);

  // Restore form state when modal becomes visible
  useEffect(() => {
    if (visible) {
      setGroupName(initialFormState.groupName || '');
      setCurrency(initialFormState.currency || 'USD');
    }
  }, [visible, initialFormState]);

  const handleSubmit = async () => {
    if (!groupName.trim()) {
      setError('Please enter a group name');
      return;
    }

    if (selectedMembers.length === 0) {
      setError('Please select at least one friend');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await onSubmit({
        name: groupName.trim(),
        currency: currency,
        member_ids: selectedMembers.map(f => f.id),
      });
      handleClose();
    } catch (err) {
      setError(err.message || 'Failed to create group');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setError('');
    setShowCurrencyPicker(false);
    onClose();
  };

  const handleOpenMemberSelection = () => {
    // Pass current form state to parent before switching modals
    onOpenSelectMembers({
      groupName,
      currency
    });
  };

  const selectedCurrency = CURRENCIES.find(c => c.code === currency);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={handleClose}
      presentationStyle="fullScreen"
    >
      <View style={[styles.modalContainer, { backgroundColor: theme.background, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
          <Text style={[styles.title, { color: theme.text }]}>Create Group</Text>
          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: theme.surfaceSecondary }]}
            onPress={handleClose}
          >
            <Text style={[styles.closeButtonText, { color: theme.text }]}>✕</Text>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            style={styles.scrollContent}
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
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

            {/* Members Selection - Now with a button to open modal */}
            <View style={styles.formSection}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.label, { color: theme.text }]}>
                  Select Members
                </Text>
                <TouchableOpacity
                  style={[styles.selectButton, { backgroundColor: COLORS.primary }]}
                  onPress={handleOpenMemberSelection}
                  disabled={isLoading}
                >
                  <Text style={styles.selectButtonText}>
                    {selectedMembers.length > 0 ? `${selectedMembers.length} Selected` : 'Choose'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Show selected members summary */}
              {selectedMembers.length > 0 ? (
                <View style={[styles.selectedSummary, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  {selectedMembers.slice(0, 3).map((friend, index) => (
                    <View key={friend.id} style={styles.summaryItem}>
                      <LinearGradient
                        colors={[COLORS.primary, COLORS.primaryDark]}
                        style={styles.summaryAvatar}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        <Text style={styles.summaryAvatarText}>{friend.name.charAt(0).toUpperCase()}</Text>
                      </LinearGradient>
                      <Text style={[styles.summaryName, { color: theme.text }]} numberOfLines={1}>
                        {friend.name}
                      </Text>
                    </View>
                  ))}
                  {selectedMembers.length > 3 && (
                    <View style={styles.summaryItem}>
                      <View style={[styles.summaryAvatar, { backgroundColor: theme.surfaceSecondary }]}>
                        <Text style={[styles.summaryAvatarText, { color: theme.text }]}>
                          +{selectedMembers.length - 3}
                        </Text>
                      </View>
                      <Text style={[styles.summaryName, { color: theme.textSecondary }]}>more</Text>
                    </View>
                  )}
                </View>
              ) : (
                <View style={[styles.emptySelection, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <Text style={[styles.emptySelectionText, { color: theme.textSecondary }]}>
                    No members selected. Tap "Choose" to add friends.
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Buttons - Fixed at bottom */}
          <View style={[styles.buttonContainer, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
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
                    <Text style={styles.submitButtonText} numberOfLines={1}>Create</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.medium,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContainer: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
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
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  label: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  selectButton: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    minWidth: 80,
    alignItems: 'center',
  },
  selectButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    color: '#FFFFFF',
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
  selectedSummary: {
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    padding: SPACING.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.sm,
    maxWidth: '45%',
  },
  summaryAvatar: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.xs,
  },
  summaryAvatarText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    color: '#FFFFFF',
  },
  summaryName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    flex: 1,
  },
  emptySelection: {
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    padding: SPACING.lg,
    alignItems: 'center',
  },
  emptySelectionText: {
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
  },
  buttonContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    borderTopWidth: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
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
