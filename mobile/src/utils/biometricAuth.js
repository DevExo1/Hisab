/**
 * Biometric Authentication Service - STUB
 * All biometric functionality disabled - always returns unavailable
 */

class BiometricAuthService {
  async isBiometricAvailable() {
    return false;
  }

  async getAvailableBiometrics() {
    return [];
  }

  async getBiometricLabel() {
    return 'Biometric';
  }

  async authenticate() {
    return {
      success: false,
      error: 'Biometric authentication is disabled',
    };
  }

  async saveBiometricEmail(email) {
    return { success: false, error: 'Biometric disabled' };
  }

  async getBiometricEmail() {
    return null;
  }

  async isBiometricEnabled() {
    return false;
  }

  async disableBiometric() {
    return { success: true };
  }

  async clearBiometricData() {
    // No-op
  }
}

export default new BiometricAuthService();
