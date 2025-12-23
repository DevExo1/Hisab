/**
 * Settle Debt Screen
 * Record a settlement payment
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useData } from '../../contexts/DataContext';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { formatCurrency } from '../../utils/currency';
import apiClient from '../../api/client';

export default function SettleDebtScreen({ route, navigation }) {
  const { groupId, settlement } = route.params;
  const { isDarkMode } = useTheme();
  const { refreshData } = useData();
  const theme = isDarkMode ? COLORS.dark : COLORS.light;

  const [amount, setAmount] = useState(settlement.total_amount.toString());
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const amountNum = parseFloat(amount) || 0;
  const isPartialPayment = amountNum < settlement.total_amount;

  const handleSubmit = async () => {
    setError('');

    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (amountNum > settlement.total_amount) {
      setError(`Amount cannot exceed ${formatCurrency(settlement.total_amount)}`);
      return;
    }

    try {
      setIsLoading(true);

      await apiClient.createSettlement({
        group_id: groupId,
        payer_id: settlement.from_user_id,
        payee_id: settlement.to_user_id,
        amount: amountNum,
        notes: notes.trim() || null,
      });

      await refreshData();

      // Show success message
      Alert.alert(
        'Payment Recorded!',
        `${settlement.from_user_name} paid ${formatCurrency(amountNum)} to ${settlement.to_user_name}${isPartialPayment ? '\n\nPartial payment recorded. Some debt remains.' : ''}`,
        [
          {
            text: 'Settle Another',
            onPress: () => navigation.goBack(),
          },
          {
            text: 'Done',
            onPress: () => navigation.navigate('GroupDetails', { groupId }),
          },
        ]
      );
    } catch (err) {
      console.error('Failed to record settlement:', err);
      setError(err.message || 'Failed to record settlement');
    } finally {
      setIsLoading(false);
    }
  };

  const setHalfAmount = () => {
    setAmount((settlement.total_amount / 2).toFixed(2));
  };

  const setFullAmount = () => {
    setAmount(settlement.total_amount.toFixed(2));
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={true}
      >
        {/* Debt Info Card */}
        <View style={[styles.debtCard, { backgroundColor: COLORS.primary + '20', borderColor: COLORS.primary + '40' }]}>
          <Text style={[styles.debtText, { color: theme.text }]}>
            <Text style={styles.debtName}>{settlement.from_user_name}</Text>
            {' owes '}
            <Text style={styles.debtName}>{settlement.to_user_name}</Text>
          </Text>
          <Text style={[styles.debtAmount, { color: COLORS.orange }]}>
            {formatCurrency(settlement.total_amount)}
          </Text>
        </View>

        {/* Error Message */}
        {error ? (
          <View style={[styles.errorCard, { backgroundColor: COLORS.error + '20', borderColor: COLORS.error }]}>
            <Text style={[styles.errorText, { color: COLORS.error }]}>{error}</Text>
          </View>
        ) : null}

        {/* Amount Input */}
        <View style={[styles.inputCard, { backgroundColor: theme.surface }, SHADOWS.medium]}>
          <Text style={[styles.inputLabel, { color: theme.text }]}>Settlement Amount</Text>
          
          <View style={[styles.amountInputContainer, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}>
            <Text style={[styles.currencySymbol, { color: theme.textSecondary }]}>$</Text>
            <TextInput
              style={[styles.amountInput, { color: theme.text }]}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={theme.textTertiary}
              editable={!isLoading}
            />
          </View>

          {/* Quick Amount Buttons */}
          <View style={styles.quickButtons}>
            <TouchableOpacity
              style={[styles.quickButton, { backgroundColor: theme.surfaceSecondary }]}
              onPress={setHalfAmount}
              disabled={isLoading}
            >
              <Text style={[styles.quickButtonText, { color: theme.text }]}>Half</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickButton, { backgroundColor: theme.surfaceSecondary }]}
              onPress={setFullAmount}
              disabled={isLoading}
            >
              <Text style={[styles.quickButtonText, { color: theme.text }]}>Full Amount</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Notes Input */}
        <View style={[styles.inputCard, { backgroundColor: theme.surface }, SHADOWS.medium]}>
          <Text style={[styles.inputLabel, { color: theme.text }]}>Notes (optional)</Text>
          <TextInput
            style={[styles.notesInput, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border, color: theme.text }]}
            value={notes}
            onChangeText={setNotes}
            placeholder="e.g., Cash payment, Venmo, Bank transfer..."
            placeholderTextColor={theme.textTertiary}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            editable={!isLoading}
          />
        </View>

        {/* Partial Payment Warning */}
        {isPartialPayment && amountNum > 0 && (
          <View style={[styles.warningCard, { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' }]}>
            <Ionicons name="bulb-sharp" size={20} color="#F59E0B" style={styles.warningIcon} />
            <Text style={[styles.warningText, { color: '#92400E' }]}>
              Partial payment: {formatCurrency(settlement.total_amount - amountNum)} will remain owed
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={[styles.actionButtonsInScroll, { backgroundColor: 'transparent' }]}>
          <TouchableOpacity
            style={[styles.cancelButton, { backgroundColor: theme.surfaceSecondary }]}
            onPress={() => navigation.goBack()}
            disabled={isLoading}
          >
            <Text style={[styles.cancelButtonText, { color: theme.text }]}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.submitButton, { opacity: isLoading ? 0.5 : 1 }]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryDark]}
              style={styles.submitButtonGradient}
            >
              <Text style={styles.submitButtonText}>
                {isLoading ? 'Recording...' : 'Record Payment'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
  },
  debtCard: {
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    alignItems: 'center',
  },
  debtText: {
    fontSize: FONT_SIZES.sm,
    marginBottom: SPACING.xs,
  },
  debtName: {
    fontWeight: FONT_WEIGHTS.bold,
  },
  debtAmount: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
  },
  errorCard: {
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
  },
  errorText: {
    fontSize: FONT_SIZES.sm,
  },
  inputCard: {
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    marginBottom: SPACING.sm,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    paddingHorizontal: SPACING.sm,
  },
  currencySymbol: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    marginRight: SPACING.xs,
  },
  amountInput: {
    flex: 1,
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    paddingVertical: SPACING.sm,
  },
  quickButtons: {
    flexDirection: 'row',
    marginTop: SPACING.sm,
    gap: SPACING.sm,
  },
  quickButton: {
    flex: 1,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
  },
  quickButtonText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.medium,
  },
  notesInput: {
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    padding: SPACING.sm,
    fontSize: FONT_SIZES.sm,
    minHeight: 80,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
  },
  warningIcon: {
    marginRight: SPACING.sm,
  },
  warningText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: SPACING.md,
    borderTopWidth: 1,
    gap: SPACING.sm,
    ...SHADOWS.medium,
  },
  actionButtonsInScroll: {
    flexDirection: 'row',
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  cancelButton: {
    flex: 1,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  submitButton: {
    flex: 1,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  submitButtonGradient: {
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
    color: '#FFFFFF',
  },
  bottomSpacer: {
    height: SPACING.md,
  },
});
