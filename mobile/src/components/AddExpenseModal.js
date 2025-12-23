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
  Pressable,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';

export default function AddExpenseModal({ visible, onClose, onSubmit, group, isDarkMode = false }) {
  const theme = isDarkMode ? COLORS.dark : COLORS.light;
  const { user } = useAuth();
  
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState(null);
  const [splitType, setSplitType] = useState('equal');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [customSplits, setCustomSplits] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Get members from group (excluding balances data, just users)
  const members = group?.members || [];

  // Reset form when modal opens
  useEffect(() => {
    if (visible && group) {
      // Select all members by default
      setSelectedMembers(members.map(m => m.user_id || m.id));
      setCustomSplits({});
      // Set current user as default payer
      setPaidBy(user?.id);
    }
  }, [visible, group, user]);

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

  const toggleMember = (memberId) => {
    if (selectedMembers.includes(memberId)) {
      setSelectedMembers(selectedMembers.filter(id => id !== memberId));
      // Remove custom split if exists
      const newSplits = { ...customSplits };
      delete newSplits[memberId];
      setCustomSplits(newSplits);
    } else {
      setSelectedMembers([...selectedMembers, memberId]);
    }
  };

  const updateCustomSplit = (memberId, value) => {
    setCustomSplits({
      ...customSplits,
      [memberId]: value
    });
  };

  if (!group) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <Pressable style={styles.overlay} onPress={handleClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View style={[styles.modalContent, { backgroundColor: theme.surface }, SHADOWS.large]}>
              {/* Header */}
              <View style={styles.header}>
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

              <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Error Message */}
                {error ? (
                  <View style={[styles.errorBox, { backgroundColor: COLORS.error + '20', borderColor: COLORS.error }]}>
                    <Text style={[styles.errorText, { color: COLORS.error }]}>⚠️ {error}</Text>
                  </View>
                ) : null}

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
                          setSplitType(type);
                          setCustomSplits({});
                        }}
                        disabled={isLoading}
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

                {/* Members Selection */}
                <View style={styles.formSection}>
                  <Text style={[styles.label, { color: theme.text }]}>
                    Split Between ({selectedMembers.length} selected)
                  </Text>
                  <View style={[styles.membersList, { backgroundColor: theme.background, borderColor: theme.border }]}>
                    {members.map((member) => {
                      const memberId = member.user_id || member.id;
                      const memberName = member.user_name || member.name || 'Unknown';
                      const isSelected = selectedMembers.includes(memberId);
                      const isCurrentUser = member.is_current_user;
                      
                      return (
                        <View key={memberId}>
                          <TouchableOpacity
                            style={[
                              styles.memberItem,
                              { backgroundColor: theme.surfaceSecondary },
                              isSelected && { borderColor: COLORS.primary, borderWidth: 2 }
                            ]}
                            onPress={() => toggleMember(memberId)}
                            disabled={isLoading}
                          >
                            <View style={styles.memberInfo}>
                              <LinearGradient
                                colors={isSelected ? [COLORS.primary, COLORS.primaryDark] : [theme.textTertiary, theme.textSecondary]}
                                style={styles.memberAvatar}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                              >
                                <Text style={styles.memberAvatarText}>{memberName.charAt(0).toUpperCase()}</Text>
                              </LinearGradient>
                              <Text style={[styles.memberName, { color: theme.text }]}>
                                {memberName}{isCurrentUser ? ' (You)' : ''}
                              </Text>
                            </View>
                            <View style={[
                              styles.checkbox,
                              { borderColor: theme.border },
                              isSelected && { backgroundColor: COLORS.primary, borderColor: COLORS.primary }
                            ]}>
                              {isSelected && <Text style={styles.checkmark}>✓</Text>}
                            </View>
                          </TouchableOpacity>

                          {/* Custom split input for exact/percentage */}
                          {isSelected && splitType !== 'equal' && (
                            <View style={styles.customSplitInput}>
                              <TextInput
                                style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                                value={customSplits[memberId]?.toString() || ''}
                                onChangeText={(text) => updateCustomSplit(memberId, text)}
                                placeholder={splitType === 'percentage' ? '0.00%' : '0.00'}
                                placeholderTextColor={theme.textTertiary}
                                keyboardType="decimal-pad"
                                editable={!isLoading}
                              />
                            </View>
                          )}
                        </View>
                      );
                    })}
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
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  keyboardView: {
    width: '100%',
  },
  modalContent: {
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    paddingBottom: SPACING.xs,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    marginTop: 2,
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
    maxHeight: 500,
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
    marginBottom: SPACING.sm,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    marginBottom: SPACING.xs,
  },
  input: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    fontSize: FONT_SIZES.md,
    height: 50,
  },
  splitTypeButtons: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  splitTypeButton: {
    flex: 1,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 36,
  },
  splitTypeText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    textAlign: 'center',
    numberOfLines: 1,
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
  membersList: {
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    padding: SPACING.xs,
    maxHeight: 300,
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
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  memberAvatarText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    color: '#FFFFFF',
  },
  memberName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
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
  customSplitInput: {
    paddingLeft: SPACING.xl,
    paddingRight: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
  },
  cancelButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    numberOfLines: 1,
  },
  submitButton: {
    flex: 1,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    height: 44,
  },
  submitButtonGradient: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
  },
  submitButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
    color: '#FFFFFF',
    numberOfLines: 1,
  },
  disabledButton: {
    opacity: 0.6,
  },
});
