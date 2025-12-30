/**
 * Biometric Authentication Service
 * Handles fingerprint and face recognition for iOS and Android
 */

import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BIOMETRIC_EMAIL_KEY = 'biometric_email';
const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';

class BiometricAuthService {
  /**
   * Check if device has biometric hardware and is enrolled
   */
  async isBiometricAvailable() {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      if (!compatible) {
        return false;
      }

      const enrolled = await LocalAuthentication.isEnrolledAsync();
      return enrolled;
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      return false;
    }
  }

  /**
   * Get available biometric types on device
   */
  async getAvailableBiometrics() {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      if (!compatible) {
        return [];
      }

      const biometrics = await LocalAuthentication.supportedAuthenticationTypesAsync();
      return biometrics;
    } catch (error) {
      console.error('Error getting available biometrics:', error);
      return [];
    }
  }

  /**
   * Get biometric type label for UI display
   */
  async getBiometricLabel() {
    try {
      const biometrics = await this.getAvailableBiometrics();
      
      // biometrics array constants:
      // 1 = FINGERPRINT
      // 2 = FACIAL_RECOGNITION
      // 3 = IRIS
      
      if (biometrics.includes(2)) {
        return 'Face ID';
      } else if (biometrics.includes(1)) {
        return 'Fingerprint';
      } else if (biometrics.includes(3)) {
        return 'Iris Scan';
      }
      
      return 'Biometric';
    } catch (error) {
      return 'Biometric';
    }
  }

  /**
   * Authenticate user with biometric
   */
  async authenticate() {
    try {
      const available = await this.isBiometricAvailable();
      if (!available) {
        return {
          success: false,
          error: 'Biometric authentication is not available on this device',
        };
      }

      const result = await LocalAuthentication.authenticateAsync({
        disableDeviceFallback: false,
        reason: 'Authenticate to login to Hisab',
        fallbackLabel: 'Use passcode',
        disableFallback: false,
      });

      if (result.success) {
        return { success: true };
      } else {
        return {
          success: false,
          error: 'Biometric authentication failed',
          cancelled: result.error === 'user_cancel',
        };
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return {
        success: false,
        error: error.message || 'Biometric authentication failed',
      };
    }
  }

  /**
   * Save user's email for biometric login
   */
  async saveBiometricEmail(email) {
    try {
      await AsyncStorage.setItem(BIOMETRIC_EMAIL_KEY, email);
      await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, 'true');
      return { success: true };
    } catch (error) {
      console.error('Error saving biometric email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get stored email for biometric login
   */
  async getBiometricEmail() {
    try {
      const email = await AsyncStorage.getItem(BIOMETRIC_EMAIL_KEY);
      return email;
    } catch (error) {
      console.error('Error retrieving biometric email:', error);
      return null;
    }
  }

  /**
   * Check if biometric login is enabled
   */
  async isBiometricEnabled() {
    try {
      const enabled = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
      return enabled === 'true';
    } catch (error) {
      return false;
    }
  }

  /**
   * Disable biometric login and clear stored data
   */
  async disableBiometric() {
    try {
      await AsyncStorage.removeItem(BIOMETRIC_EMAIL_KEY);
      await AsyncStorage.removeItem(BIOMETRIC_ENABLED_KEY);
      return { success: true };
    } catch (error) {
      console.error('Error disabling biometric:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Clear all biometric data (logout)
   */
  async clearBiometricData() {
    try {
      await AsyncStorage.removeItem(BIOMETRIC_EMAIL_KEY);
      await AsyncStorage.removeItem(BIOMETRIC_ENABLED_KEY);
    } catch (error) {
      console.error('Error clearing biometric data:', error);
    }
  }
}

export default new BiometricAuthService();
