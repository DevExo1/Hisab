/**
 * Select Split Members Modal Component
 * Modal for selecting members and their split amounts/percentages
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS } from '../constants/theme';

export default function SelectSplitMembersModal({ 
  visible, 
  onClose, 
  onDone, 
  members = [], 
  splitType = 'equal',
  totalAmount = 0,
  initialSelectedMembers = [],
  initialCustomSplits = {},
  isDarkMode = false 
}) {
  const theme = isDarkMode ? COLORS.dark : COLORS.light;
  const insets = useSafeAreaInsets();
  
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [customSplits, setCustomSplits] = useState({});
  const [validationError, setValidationError] = useState('');

  // Initialize when modal opens - only on visibility change
  useEffect(() => {
    if (visible) {
      setSelectedMembers(initialSelectedMembers);
      setCustomSplits(initialCustomSplits);
      setValidationError('');
    }
  }, [visible]);

  const toggleMember = (memberId) => {
    if (selectedMembers.includes(memberId)) {
      const newSelected = selectedMembers.filter(id => id !== memberId);
      setSelectedMembers(newSelected);
      // Remove custom split if exists
      const newSplits = { ...customSplits };
      delete newSplits[memberId];
      setCustomSplits(newSplits);
    } else {
      setSelectedMembers([...selectedMembers, memberId]);
    }
    setValidationError('');
  };

  const updateCustomSplit = (memberId, value) => {
    setCustomSplits({
      ...customSplits,
      [memberId]: value
    });
    setValidationError('');
  };

  const validateAndDone = () => {
    if (selectedMembers.length === 0) {
      setValidationError('Please select at least one member');
      return;
    }

    // Validation for exact amounts
    if (splitType === 'exact') {
      const total = selectedMembers.reduce((sum, memberId) => {
        return sum + (parseFloat(customSplits[memberId]) || 0);
      }, 0);
      
      if (Math.abs(total - totalAmount) > 0.01) {
        setValidationError(`Exact amounts must total ${totalAmount.toFixed(2)}. Current: ${total.toFixed(2)}`);
        return;
      }

      // Check all selected members have amounts
      const missingAmounts = selectedMembers.filter(id => !customSplits[id] || parseFloat(customSplits[id]) <= 0);
      if (missingAmounts.length > 0) {
        setValidationError('All selected members must have valid amounts');
        return;
      }
    }

    // Validation for percentages
    if (splitType === 'percentage') {
      const totalPct = selectedMembers.reduce((sum, memberId) => {
        return sum + (parseFloat(customSplits[memberId]) || 0);
      }, 0);
      
      if (Math.abs(totalPct - 100) > 0.1) {
        setValidationError(`Percentages must total 100%. Current: ${totalPct.toFixed(1)}%`);
        return;
      }

      // Check all selected members have percentages
      const missingPcts = selectedMembers.filter(id => !customSplits[id] || parseFloat(customSplits[id]) <= 0);
      if (missingPcts.length > 0) {
        setValidationError('All selected members must have valid percentages');
        return;
      }
    }

    onDone(selectedMembers, customSplits);
    onClose();
  };

  const handleClose = () => {
    setValidationError('');
    onClose();
  };

  // Calculate totals for display
  const getCurrentTotal = () => {
    if (splitType === 'equal') {
      return `${selectedMembers.length} ${selectedMembers.length === 1 ? 'member' : 'members'}`;
    } else if (splitType === 'exact') {
      const total = selectedMembers.reduce((sum, id) => sum + (parseFloat(customSplits[id]) || 0), 0);
      return `${total.toFixed(2)} / ${totalAmount.toFixed(2)}`;
    } else {
      const total = selectedMembers.reduce((sum, id) => sum + (parseFloat(customSplits[id]) || 0), 0);
      return `${total.toFixed(1)}% / 100%`;
    }
  };

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
          <View style={styles.headerLeft}>
            <Text style={[styles.title, { color: theme.text }]}>
              {splitType === 'equal' ? 'Equal Split' : splitType === 'exact' ? 'Exact Amounts' : 'Split by Percentage'}
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              {getCurrentTotal()}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: theme.surfaceSecondary }]}
            onPress={handleClose}
          >
            <Text style={[styles.closeButtonText, { color: theme.text }]}>✕</Text>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          {/* Error Message - Keep at top */}
          {validationError ? (
            <View style={styles.errorContainer}>
              <View style={[styles.errorBox, { backgroundColor: COLORS.error + '20', borderColor: COLORS.error }]}>
                <Text style={[styles.errorText, { color: COLORS.error }]}>⚠️ {validationError}</Text>
              </View>
            </View>
          ) : null}

          {/* Members List */}
          <ScrollView
            style={styles.scrollContent}
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Info box inside scroll - scrolls with content */}
            {splitType !== 'equal' && (
              <View style={[styles.infoBox, { backgroundColor: COLORS.primary + '20', borderColor: COLORS.primary + '40' }]}>
                <Text style={[styles.infoText, { color: COLORS.primary }]}>
                  💡 {splitType === 'exact' 
                    ? `Enter exact amounts for each member. Total must equal ${totalAmount.toFixed(2)}.`
                    : 'Enter percentages for each member. Total must equal 100%.'}
                </Text>
              </View>
            )}
            {members.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyStateText, { color: theme.textSecondary }]}>
                  No members available
                </Text>
              </View>
            ) : (
              <>
                {/* Select All / Clear All for equal split */}
                {splitType === 'equal' && (
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: theme.surfaceSecondary }]}
                      onPress={() => setSelectedMembers(members.map(m => m.user_id || m.id))}
                    >
                      <Text style={[styles.actionButtonText, { color: COLORS.primary }]}>Select All</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: theme.surfaceSecondary }]}
                      onPress={() => setSelectedMembers([])}
                    >
                      <Text style={[styles.actionButtonText, { color: theme.text }]}>Clear All</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {members.map((member) => {
                  const memberId = member.user_id || member.id;
                  const memberName = member.user_name || member.name || 'Unknown';
                  const isSelected = selectedMembers.includes(memberId);
                  const isCurrentUser = member.is_current_user;
                  
                  return (
                    <View key={memberId} style={styles.memberItemContainer}>
                      <TouchableOpacity
                        style={[
                          styles.memberItem,
                          { backgroundColor: theme.surface },
                          isSelected && { borderColor: COLORS.primary, borderWidth: 2 }
                        ]}
                        onPress={() => toggleMember(memberId)}
                        activeOpacity={0.7}
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
                            key={memberId}
                            style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                            value={customSplits[memberId]?.toString() || ''}
                            onChangeText={(text) => updateCustomSplit(memberId, text)}
                            placeholder={splitType === 'percentage' ? '0.00' : '0.00'}
                            placeholderTextColor={theme.textTertiary}
                            keyboardType="decimal-pad"
                          />
                          <Text style={[styles.inputSuffix, { color: theme.textSecondary }]}>
                            {splitType === 'percentage' ? '%' : ''}
                          </Text>
                        </View>
                      )}
                    </View>
                  );
                })}
              </>
            )}
          </ScrollView>

          {/* Buttons - Fixed at bottom */}
          <View style={[styles.buttonContainer, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.cancelButton, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}
                onPress={handleClose}
              >
                <Text style={[styles.cancelButtonText, { color: theme.text }]} numberOfLines={1}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={validateAndDone}
              >
                <LinearGradient
                  colors={[COLORS.primary, COLORS.primaryDark]}
                  style={styles.submitButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.submitButtonText} numberOfLines={1}>
                    Done ({selectedMembers.length})
                  </Text>
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
  headerLeft: {
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
  errorContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xs,
  },
  infoBox: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    marginBottom: SPACING.sm,
  },
  infoText: {
    fontSize: FONT_SIZES.sm,
    lineHeight: 20,
  },
  errorBox: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    marginBottom: SPACING.sm,
  },
  errorText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContainer: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  emptyState: {
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
    lineHeight: 24,
  },
  actionRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  actionButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  memberItemContainer: {
    marginBottom: SPACING.sm,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: SPACING.sm,
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
    fontWeight: FONT_WEIGHTS.bold,
    color: '#FFFFFF',
  },
  memberName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: FONT_WEIGHTS.bold,
  },
  customSplitInput: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
    marginLeft: SPACING.xl + SPACING.md,
    marginRight: SPACING.md,
  },
  input: {
    flex: 1,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    fontSize: FONT_SIZES.md,
    minHeight: 40,
  },
  inputSuffix: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    marginLeft: SPACING.sm,
    minWidth: 20,
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
    justifyContent: 'center',
    minHeight: 44,
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
});
