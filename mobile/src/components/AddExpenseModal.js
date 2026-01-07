/**
 * Add Expense Modal Component
 * Modal for adding expenses to a group
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
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import SelectSplitMembersModal from './SelectSplitMembersModal';
import { useAuth } from '../contexts/AuthContext';

export default function AddExpenseModal({ visible, onClose, onSubmit, group, isDarkMode = false }) {
  const theme = isDarkMode ? COLORS.dark : COLORS.light;
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState(null);
  const [splitType, setSplitType] = useState('equal');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [customSplits, setCustomSplits] = useState({});
  const [showSplitMembersModal, setShowSplitMembersModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Get members from group (excluding balances data, just users)
  const members = group?.members || [];

  // Reset form when modal opens - only on visibility change
  useEffect(() => {
    if (visible && group) {
      // Only reset if modal is newly opened (not already open)
      // Select all members by default only on initial open
      if (selectedMembers.length === 0) {
        setSelectedMembers(members.map(m => m.user_id || m.id));
      }
      if (!paidBy) {
        setPaidBy(user?.id);
      }
      setCustomSplits({});
    }
  }, [visible]);

  const handleOpenSplitMembers = () => {
    setShowSplitMembersModal(true);
  };

  const handleSplitMembersSelected = (members, splits) => {
    setSelectedMembers(members);
    setCustomSplits(splits);
    setShowSplitMembersModal(false);
  };

  const handleSubmit = async () => {
    // Validation
    if (!description.trim()) {
      setError('Please enter a description');
      return;
    }

    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (selectedMembers.length === 0) {
      setError('Please select at least one person to split with');
      return;
    }

    // Validate split amounts
    if (splitType === 'exact') {
      const total = selectedMembers.reduce((sum, memberId) => {
        return sum + (parseFloat(customSplits[memberId]) || 0);
      }, 0);
      
      if (Math.abs(total - amountNum) > 0.01) {
        setError(`Exact amounts must total ${amountNum.toFixed(2)}. Current: ${total.toFixed(2)}`);
        return;
      }
    }

    if (splitType === 'percentage') {
      const totalPct = selectedMembers.reduce((sum, memberId) => {
        return sum + (parseFloat(customSplits[memberId]) || 0);
      }, 0);
      
      if (Math.abs(totalPct - 100) > 0.1) {
        setError(`Percentages must total 100%. Current: ${totalPct.toFixed(1)}%`);
        return;
      }
    }

    setIsLoading(true);
    setError('');

    try {
      // Build splits object based on split type
      const splits = {};
      selectedMembers.forEach(memberId => {
        if (splitType === 'equal') {
          splits[memberId] = 1; // Backend will calculate equal split
        } else {
          splits[memberId] = parseFloat(customSplits[memberId]) || 0;
        }
      });

      await onSubmit({
        description: description.trim(),
        amount: amountNum,
        paid_by_user_id: paidBy,
        split_type: splitType,
        splits: splits,
      });
      
      handleClose();
    } catch (err) {
      setError(err.message || 'Failed to add expense');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setDescription('');
    setAmount('');
    setPaidBy(user?.id);
    setSplitType('equal');
    setSelectedMembers([]);
    setCustomSplits({});
    setError('');
    onClose();
  };



  if (!group) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={handleClose}
      presentationStyle="fullScreen"
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.background, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
          <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
              <View style={styles.headerText}>
                <Text style={[styles.title, { color: theme.text }]}>Add Expense</Text>
                {group?.name && (
                  <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                    to {group.name}
                  </Text>
                )}
              </View>
              <TouchableOpacity
                style={[styles.closeButton, { backgroundColor: theme.surfaceSecondary }]}
                onPress={handleClose}
              >
                <Text style={[styles.closeButtonText, { color: theme.text }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.scrollContent}
              contentContainerStyle={styles.scrollContainer}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              bounces={false}
            >
            {/* Error Message */}
            {error ? (
              <View style={[styles.errorBox, { backgroundColor: COLORS.error + '20', borderColor: COLORS.error }]}>
                <Text style={[styles.errorText, { color: COLORS.error }]}>⚠️ {error}</Text>
              </View>
            ) : null}

            {/* Paid By Selection */}
            <View style={styles.formSection}>
              <Text style={[styles.label, { color: theme.text }]}>Paid By</Text>
              <View style={[styles.pickerContainer, { backgroundColor: theme.background, borderColor: theme.border }]}>
                <Picker
                  selectedValue={paidBy}
                  onValueChange={(value) => setPaidBy(value)}
                  style={[styles.picker, { color: theme.text, backgroundColor: 'transparent' }]}
                  enabled={!isLoading}
                  dropdownIconColor={theme.textSecondary}
                  itemStyle={Platform.OS === 'ios' ? { height: 120 } : undefined}
                >
                  {members.length === 0 && (
                    <Picker.Item label="No members available" value={null} enabled={false} />
                  )}
                  {members.map((member) => {
                    const memberId = member.user_id || member.id;
                    const memberName = member.user_name || member.name;
                    const label = memberId === user?.id ? `${memberName} (You)` : memberName;
                    return (
                      <Picker.Item 
                        key={memberId} 
                        label={label} 
                        value={memberId}
                        color={theme.text}
                      />
                    );
                  })}
                </Picker>
              </View>
            </View>
            {/* Description Input */}
            <View style={styles.formSection}>
              <Text style={[styles.label, { color: theme.text }]}>Description</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                value={description}
                onChangeText={(text) => {
                  setDescription(text);
                  setError('');
                }}
                placeholder="e.g., Dinner, Groceries, Uber"
                placeholderTextColor={theme.textTertiary}
                editable={!isLoading}
              />
            </View>
            {/* Amount Input */}
            <View style={styles.formSection}>
              <Text style={[styles.label, { color: theme.text }]}>Amount ({group.currency || 'USD'})</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                value={amount}
                onChangeText={(text) => {
                  setAmount(text);
                  setError('');
                }}
                placeholder="0.00"
                placeholderTextColor={theme.textTertiary}
                keyboardType="decimal-pad"
                editable={!isLoading}
              />
            </View>

            {/* Split Type */}
            <View style={styles.formSection}>
              <Text style={[styles.label, { color: theme.text }]}>Split Type</Text>
              <View style={styles.splitTypeButtons}>
                {['equal', 'exact', 'percentage'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.splitTypeButton,
                      { backgroundColor: theme.surfaceSecondary, borderColor: theme.border },
                      splitType === type && { backgroundColor: COLORS.primary, borderColor: COLORS.primary }
                    ]}
                    onPress={() => {
                      // Set split type and open the modal
                      setSplitType(type);
                      handleOpenSplitMembers();
                    }}
                    disabled={isLoading || !amount || parseFloat(amount) <= 0}
                  >
                    <Text style={[
                      styles.splitTypeText,
                      { color: theme.text },
                      splitType === type && { color: '#FFFFFF' }
                    ]}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Split Between Section */}
            <View style={styles.formSection}>
              <Text style={[styles.label, { color: theme.text }]}>
                Split Between {selectedMembers.length > 0 && `(${selectedMembers.length} selected)`}
              </Text>

              {/* Show selected members summary */}
              {selectedMembers.length > 0 ? (
                <View style={[styles.selectedSummary, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <Text style={[styles.summaryTitle, { color: theme.textSecondary }]}>
                    Split: {splitType.charAt(0).toUpperCase() + splitType.slice(1)}
                  </Text>
                  {members.filter(m => selectedMembers.includes(m.user_id || m.id)).slice(0, 3).map((member) => {
                    const memberId = member.user_id || member.id;
                    const memberName = member.user_name || member.name || 'Unknown';
                    return (
                      <View key={memberId} style={styles.summaryItem}>
                        <LinearGradient
                          colors={[COLORS.primary, COLORS.primaryDark]}
                          style={styles.summaryAvatar}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                        >
                          <Text style={styles.summaryAvatarText}>{memberName.charAt(0).toUpperCase()}</Text>
                        </LinearGradient>
                        <View style={styles.summaryDetails}>
                          <Text style={[styles.summaryName, { color: theme.text }]} numberOfLines={1}>
                            {memberName}
                          </Text>
                          {splitType !== 'equal' && customSplits[memberId] && (
                            <Text style={[styles.summaryAmount, { color: theme.textSecondary }]}>
                              {splitType === 'percentage' ? `${customSplits[memberId]}%` : customSplits[memberId]}
                            </Text>
                          )}
                        </View>
                      </View>
                    );
                  })}
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
                    {!amount || parseFloat(amount) <= 0 
                      ? 'Enter an amount first to select members'
                      : 'No members selected. Tap "Choose" to split the expense.'}
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Buttons - Fixed at bottom with safe area */}
          <View style={[styles.buttonContainer, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.cancelButton, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}
                onPress={handleClose}
                disabled={isLoading}
              >
                <Text style={[styles.cancelButtonText, { color: theme.text }]}>Cancel</Text>
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
                    <Text style={styles.submitButtonText}>Add Expense</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
      </KeyboardAvoidingView>

      {/* Select Split Members Modal */}
      <SelectSplitMembersModal
        visible={showSplitMembersModal}
        onClose={() => setShowSplitMembersModal(false)}
        onDone={handleSplitMembersSelected}
        members={members}
        splitType={splitType}
        totalAmount={parseFloat(amount) || 0}
        initialSelectedMembers={selectedMembers}
        initialCustomSplits={customSplits}
        isDarkMode={isDarkMode}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  container: {
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
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    marginTop: 2,
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
  scrollContent: {
    flex: 1,
  },
  scrollContainer: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl * 4, // Extra padding so content scrolls above keyboard
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
  selectedSummary: {
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    padding: SPACING.md,
  },
  summaryTitle: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.semibold,
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  summaryAvatar: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  summaryAvatarText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    color: '#FFFFFF',
  },
  summaryDetails: {
    flex: 1,
  },
  summaryName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
  },
  summaryAmount: {
    fontSize: FONT_SIZES.xs,
    marginTop: 2,
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
  label: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    marginBottom: SPACING.xs,
  },
  input: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    fontSize: FONT_SIZES.md,
    minHeight: 50,
  },
  splitTypeButtons: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  splitTypeButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
  },
  splitTypeText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    textAlign: 'center',
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md,
    overflow: Platform.OS === 'ios' ? 'visible' : 'hidden',
    height: Platform.OS === 'ios' ? 150 : 50,
    justifyContent: 'center',
  },
  picker: {
    width: '100%',
    height: Platform.OS === 'ios' ? 150 : 50,
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
    minHeight: 48,
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
