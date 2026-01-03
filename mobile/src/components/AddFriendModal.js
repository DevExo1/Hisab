/**
 * Add Friend Modal Component
 * Modal for adding a new friend by email
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  Animated,
  PanResponder,
  Dimensions,
  Keyboard,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, SHADOWS } from '../constants/theme';

export default function AddFriendModal({ visible, onClose, onSubmit, isDarkMode = false }) {
  const insets = useSafeAreaInsets();
  const theme = isDarkMode ? COLORS.dark : COLORS.light;

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Layout and gesture state
  const windowHeight = Dimensions.get('window').height;
  const [modalHeight, setModalHeight] = useState(0);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const translateY = useRef(new Animated.Value(0)).current;
  const currentYRef = useRef(0);

  const initialTop = useMemo(() => insets.top + SPACING.md, [insets.top]);

  const computeMaxY = () => {
    const max = Math.max(0, windowHeight - keyboardHeight - modalHeight - insets.bottom - SPACING.md);
    return max;
  };

  const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 4,
      onPanResponderMove: (_, gesture) => {
        const maxY = computeMaxY();
        const next = clamp(currentYRef.current + gesture.dy, 0, maxY);
        translateY.setValue(next);
      },
      onPanResponderRelease: (_, gesture) => {
        const maxY = computeMaxY();
        const next = clamp(currentYRef.current + gesture.dy, 0, maxY);
        currentYRef.current = next;
        Animated.spring(translateY, { toValue: next, useNativeDriver: true, damping: 20, stiffness: 200, mass: 0.6 }).start();
      },
    })
  ).current;

  useEffect(() => {
    // Initialize position when modal becomes visible
    if (visible) {
      currentYRef.current = initialTop;
      translateY.setValue(initialTop);
    }
  }, [visible, initialTop, translateY]);

  useEffect(() => {
    // Keyboard handlers to recompute bounds
    const onShow = (e) => {
      const kh = e?.endCoordinates?.height ?? 0;
      setKeyboardHeight(kh);
      // If current position would be obscured, snap up within bounds
      const maxY = computeMaxY();
      const next = clamp(currentYRef.current, 0, maxY);
      currentYRef.current = next;
      translateY.stopAnimation(() => {
        Animated.spring(translateY, { toValue: next, useNativeDriver: true, damping: 20, stiffness: 200, mass: 0.6 }).start();
      });
    };
    const onHide = () => {
      setKeyboardHeight(0);
      const maxY = computeMaxY();
      const next = clamp(currentYRef.current, 0, maxY);
      currentYRef.current = next;
      translateY.stopAnimation(() => {
        Animated.spring(translateY, { toValue: next, useNativeDriver: true, damping: 20, stiffness: 200, mass: 0.6 }).start();
      });
    };

    const showEvt = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const subShow = Keyboard.addListener(showEvt, onShow);
    const subHide = Keyboard.addListener(hideEvt, onHide);
    return () => {
      subShow.remove();
      subHide.remove();
    };
  }, [translateY, windowHeight, insets.bottom, modalHeight]);

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError('Please enter an email address');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await onSubmit({ friend_email: email.trim() });
      setEmail('');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to add friend');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setError('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Pressable onPress={(e) => e.stopPropagation()} style={StyleSheet.absoluteFill}>
          <Animated.View
            style={[
              styles.modalContainer,
              { transform: [{ translateY }], paddingTop: insets.top > 0 ? 0 : SPACING.sm },
            ]}
            onLayout={(e) => {
              const h = e.nativeEvent.layout.height;
              if (h !== modalHeight) {
                setModalHeight(h);
              }
            }}
            {...panResponder.panHandlers}
          >
            {/* Drag handle */}
            <View style={styles.dragHandleContainer}>
              <View style={[styles.dragHandle, { backgroundColor: theme.border }]} />
            </View>

            <View style={[styles.modalContent, { backgroundColor: theme.surface }, SHADOWS.large]}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={[styles.title, { color: theme.text }]}>Add Friend</Text>
                <TouchableOpacity
                  style={[styles.closeButton, { backgroundColor: theme.surfaceSecondary }]}
                  onPress={handleClose}
                >
                  <Text style={[styles.closeButtonText, { color: theme.text }]}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Info Box */}
              <View style={[styles.infoBox, { backgroundColor: COLORS.primary + '20', borderColor: COLORS.primary + '40' }]}>
                <Text style={[styles.infoText, { color: COLORS.primary }]}>\n                  💡 <Text style={{ fontWeight: FONT_WEIGHTS.bold }}>How it works:</Text> Your friend must be registered in the system first. Ask them to sign up, then you can add them by their email address.
                </Text>
              </View>

              {/* Error Message */}
              {error ? (
                <View style={[styles.errorBox, { backgroundColor: COLORS.error + '20', borderColor: COLORS.error }]}>
                  <Text style={[styles.errorText, { color: COLORS.error }]}>⚠️ {error}</Text>
                </View>
              ) : null}

              {/* Email Input */}
              <View style={styles.formSection}>
                <Text style={[styles.label, { color: theme.text }]}>Friend's Email</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setError('');
                  }}
                  placeholder="Enter your friend's email"
                  placeholderTextColor={theme.textTertiary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                />
              </View>

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
                      <Text style={styles.submitButtonText} numberOfLines={1}>Add</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    position: 'absolute',
    top: 0,
    left: SPACING.md,
    right: SPACING.md,
  },
  modalContent: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    width: '100%',
  },
  dragHandleContainer: {
    width: '100%',
    alignItems: 'center',
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xs,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    opacity: 0.8,
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
  infoBox: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    marginBottom: SPACING.md,
  },
  infoText: {
    fontSize: FONT_SIZES.sm,
    lineHeight: 20,
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
