/**
 * Profile Settings Screen
 * User profile and app settings
 */

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Alert,
  ActivityIndicator,
  Switch
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import apiClient from '../../api/client';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const theme = isDarkMode ? COLORS.dark : COLORS.light;

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || user.full_name || '');
    }
  }, [user]);


  const handleSaveChanges = async () => {
    setError('');
    setSuccessMessage('');

    // Validate name
    if (!name.trim()) {
      setError('Name cannot be empty');
      return;
    }

    // Validate password if provided
    if (password) {
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
    }

    setIsLoading(true);

    try {
      const updateData = { name: name.trim() };
      if (password) {
        updateData.password = password;
      }

      await apiClient.updateProfile(updateData);
      
      setSuccessMessage('Profile updated successfully!');
      setPassword('');
      setConfirmPassword('');
      
      // Show success message for 2 seconds
      setTimeout(() => setSuccessMessage(''), 2000);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };


  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => await logout()
        }
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        {/* Header with Avatar */}
        <View style={styles.header}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryDark]}
            style={styles.avatarGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase() || '?'}</Text>
          </LinearGradient>
          <Text style={[styles.title, { color: theme.text }]}>Profile Settings</Text>
        </View>

        {/* Email Display (Read-only) */}
        <View style={[styles.infoBox, { backgroundColor: theme.surfaceSecondary }]}>
          <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Email</Text>
          <Text style={[styles.infoText, { color: theme.text }]}>{user?.email}</Text>
          <Text style={[styles.infoNote, { color: theme.textTertiary }]}>
            (Email cannot be changed)
          </Text>
        </View>

        {/* Error Message */}
        {error ? (
          <View style={[styles.errorBox, { backgroundColor: COLORS.error + '20', borderColor: COLORS.error }]}>
            <Text style={[styles.errorText, { color: COLORS.error }]}>⚠️ {error}</Text>
          </View>
        ) : null}

        {/* Success Message */}
        {successMessage ? (
          <View style={[styles.successBox, { backgroundColor: COLORS.success + '20', borderColor: COLORS.success }]}>
            <Text style={[styles.successText, { color: COLORS.success }]}>✅ {successMessage}</Text>
          </View>
        ) : null}

        {/* Name Input */}
        <View style={styles.formSection}>
          <Text style={[styles.label, { color: theme.text }]}>Full Name</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            placeholderTextColor={theme.textTertiary}
            editable={!isLoading}
          />
        </View>

        {/* Password Input */}
        <View style={styles.formSection}>
          <Text style={[styles.label, { color: theme.text }]}>New Password (optional)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
            value={password}
            onChangeText={setPassword}
            placeholder="Leave blank to keep current password"
            placeholderTextColor={theme.textTertiary}
            secureTextEntry
            editable={!isLoading}
          />
        </View>

        {/* Confirm Password Input - Only show if password is entered */}
        {password ? (
          <View style={styles.formSection}>
            <Text style={[styles.label, { color: theme.text }]}>Confirm New Password</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Re-enter new password"
              placeholderTextColor={theme.textTertiary}
              secureTextEntry
              editable={!isLoading}
            />
          </View>
        ) : null}

        {/* Save Changes Button */}
        <TouchableOpacity
          style={[styles.saveButton, SHADOWS.medium, isLoading && styles.disabledButton]}
          onPress={handleSaveChanges}
          disabled={isLoading}
        >
          <LinearGradient
            colors={isLoading ? [COLORS.primary + '80', COLORS.primaryDark + '80'] : [COLORS.primary, COLORS.primaryDark]}
            style={styles.saveButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>💾 Save Changes</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Dark Mode Toggle */}
        <View style={styles.settingsSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Appearance</Text>
          <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={toggleTheme}
          >
            <Text style={[styles.settingText, { color: theme.text }]}>
              {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </Text>
          </TouchableOpacity>
        </View>


        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: theme.surface, borderColor: '#EF4444' }]}
          onPress={handleLogout}
        >
          <Text style={[styles.logoutButtonText, { color: '#EF4444' }]}>🚪 Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: SPACING.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  avatarGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  avatarText: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    color: '#FFF',
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
  },
  infoBox: {
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.xl,
  },
  infoLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  infoText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  infoNote: {
    fontSize: FONT_SIZES.xs,
    fontStyle: 'italic',
  },
  form: {
    marginBottom: SPACING.xl,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  input: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    fontSize: FONT_SIZES.md,
    borderWidth: 1,
    marginBottom: SPACING.md,
  },
  pickerContainer: {
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    marginBottom: SPACING.xl,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  saveButton: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.xl,
  },
  saveButtonGradient: {
    padding: SPACING.md,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  settingsSection: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  settingItem: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    marginBottom: SPACING.sm,
  },
  settingText: {
    fontSize: FONT_SIZES.md,
  },
  logoutButton: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  logoutButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
});

