/**
 * Login Screen
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants/theme';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? COLORS.dark : COLORS.light;
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasInternet, setHasInternet] = useState(true);
  const [error, setError] = useState('');
  const [checkingConnection, setCheckingConnection] = useState(true);

  // Check internet connection on mount and when screen is focused
  useEffect(() => {
    checkInternetConnection();
    const interval = setInterval(checkInternetConnection, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const checkInternetConnection = async () => {
    try {
      // Ping our own API instead of a third-party domain.
      // Some Android networks/devices block or intercept requests to google.com,
      // which can incorrectly mark the device as "offline" even when our API is reachable.
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      // Use the same API base URL as the API client (supports EXPO_PUBLIC_API_URL overrides).
      const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'https://hisabapi.exolutus.com';

      await fetch(`${baseUrl}/api/health`, {
        method: 'GET',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      setHasInternet(true);
    } catch (error) {
      setHasInternet(false);
    } finally {
      setCheckingConnection(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Check internet connection before attempting login
    if (!hasInternet) {
      Alert.alert(
        'No Internet Connection',
        'Please check your internet connection and try again.',
        [
          { text: 'Retry', onPress: () => checkInternetConnection() },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
      return;
    }

    setError(''); // Clear previous errors
    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);

    if (result.success) {
      // Login successful - no biometric prompt
    } else if (!result.success) {
      const errorMessage = result.error || 'Invalid email or password';
      setError(errorMessage);
      // No Alert popup - inline error display is sufficient and follows app design pattern
    }
  };


  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <ScrollView 
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={16}
      >
        {/* Logo and Branding */}
        <View style={styles.brandingContainer}>
          <View style={styles.logoWrapper}>
            <Image 
              source={require('../../../assets/icon.png')} 
              style={styles.logo}
              resizeMode="cover"
            />
          </View>
          <Text style={[styles.appName, { color: theme.text }]}>
            Hisab
          </Text>
          <Text style={[styles.tagline, { color: theme.textSecondary }]}>
            Group Accounts Manager
          </Text>
          <Text style={[styles.welcomeText, { color: theme.text }]}>
            {isLoading ? 'Logging in...' : 'Welcome back'}
          </Text>
        </View>

        {/* Internet Connection Status */}
        {!checkingConnection && (
          <View style={[
            styles.connectionStatus,
            { backgroundColor: hasInternet ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }
          ]}>
            <Ionicons 
              name={hasInternet ? 'wifi-sharp' : 'wifi-outline'} 
              size={16} 
              color={hasInternet ? '#10B981' : '#EF4444'} 
            />
            <Text style={[
              styles.connectionText,
              { color: hasInternet ? '#10B981' : '#EF4444' }
            ]}>
              {hasInternet ? 'Connected' : 'No Internet Connection'}
            </Text>
            {!hasInternet && (
              <TouchableOpacity onPress={checkInternetConnection} style={styles.retryButton}>
                <Text style={[styles.retryText, { color: '#EF4444' }]}>Retry</Text>
              </TouchableOpacity>
            )}
          </View>
        )}




        {error && (
          <View style={[styles.errorBox, { backgroundColor: COLORS.error + '20', borderColor: COLORS.error }]}>
            <Text style={[styles.errorText, { color: COLORS.error }]}>⚠️ {error}</Text>
          </View>
        )}

        <View style={styles.form}>
          <TextInput
            style={[styles.input, { 
              backgroundColor: theme.surface,
              color: theme.text,
              borderColor: theme.border,
            }]}
            placeholder="Email"
            placeholderTextColor={theme.textTertiary}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />


          <TextInput
            style={[styles.input, { 
              backgroundColor: theme.surface,
              color: theme.text,
              borderColor: theme.border,
            }]}
            placeholder="Password"
            placeholderTextColor={theme.textTertiary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </TouchableOpacity>


          <TouchableOpacity
            style={[styles.button, styles.secondaryButton, { borderColor: theme.border }]}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={[styles.secondaryButtonText, { color: COLORS.primary }]}>
              Create Account
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    paddingBottom: SPACING.xl * 3, // Extra padding for keyboard avoidance
  },
  brandingContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  logoWrapper: {
    width: 100,
    height: 100,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  logo: {
    width: 100,
    height: 100,
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  tagline: {
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  welcomeText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    textAlign: 'center',
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
  },
  connectionText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },
  retryButton: {
    marginLeft: SPACING.sm,
    paddingHorizontal: SPACING.xs,
  },
  retryText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  form: {
    // gap not fully supported, use marginBottom on children instead
  },
  input: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    fontSize: FONT_SIZES.md,
    borderWidth: 1,
    marginBottom: SPACING.md,
  },
  button: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  buttonText: {
    color: '#FFF',
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  secondaryButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  errorBox: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    marginBottom: SPACING.md,
  },
  errorText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
  },
});
