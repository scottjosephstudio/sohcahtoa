/**
 * Secure Cart Storage
 * Wraps cart storage operations with secure storage instead of localStorage
 */

import SecureStorage from '../../../lib/secureStorage.js';

// Cart-specific storage keys
const CART_KEYS = {
  CART_STATE: 'cartState',
  USER_EMAIL: 'userEmail',
  FIRST_NAME: 'firstName',
  LAST_NAME: 'lastName',
  BILLING_DETAILS: 'billingDetails',
  PURCHASES: 'purchases',
  HAS_PROCEED_BEEN_CLICKED: 'hasProceedBeenClicked',
  PAYMENT_PROCESSING: 'paymentProcessingKey',
  EULA_ACCEPTED: 'eulaAccepted',
  SELECTED_USAGE: 'selectedUsage',
  REGISTRATION_STATE: 'registrationState',
  LAST_FONT_SELECTION: 'lastFontSelection'
};

class SecureCartStorage {
  constructor() {
    this.isSecureAvailable = SecureStorage.isSecureStorageAvailable();
  }

  // Get cart state securely
  async getCartState() {
    const data = await SecureStorage.database.get(CART_KEYS.CART_STATE);
    return data || null;
  }

  // Save cart state securely
  async saveCartState(cartState) {
    await SecureStorage.database.store(CART_KEYS.CART_STATE, cartState, {
      expires: 24 * 60 * 60 * 1000 // 24 hours
    });
  }

  // Get user data securely
  async getUserData() {
    const [email, firstName, lastName] = await Promise.all([
      SecureStorage.session.get(CART_KEYS.USER_EMAIL),
      SecureStorage.session.get(CART_KEYS.FIRST_NAME),
      SecureStorage.session.get(CART_KEYS.LAST_NAME)
    ]);

    return {
      email: email || '',
      firstName: firstName || '',
      lastName: lastName || ''
    };
  }

  // Save user data securely
  async saveUserData(userData) {
    await Promise.all([
      SecureStorage.session.set(CART_KEYS.USER_EMAIL, userData.email, { encrypt: true }),
      SecureStorage.session.set(CART_KEYS.FIRST_NAME, userData.firstName, { encrypt: true }),
      SecureStorage.session.set(CART_KEYS.LAST_NAME, userData.lastName, { encrypt: true })
    ]);
  }

  // Get billing details securely
  async getBillingDetails() {
    return await SecureStorage.session.get(CART_KEYS.BILLING_DETAILS);
  }

  // Save billing details securely
  async saveBillingDetails(billingDetails) {
    await SecureStorage.session.set(CART_KEYS.BILLING_DETAILS, billingDetails, { encrypt: true });
  }

  // Get purchases securely
  async getPurchases() {
    const purchases = await SecureStorage.database.get(CART_KEYS.PURCHASES);
    return purchases || [];
  }

  // Save purchases securely
  async savePurchases(purchases) {
    await SecureStorage.database.store(CART_KEYS.PURCHASES, purchases, {
      expires: 30 * 24 * 60 * 60 * 1000 // 30 days
    });
  }

  // Get registration state securely
  async getRegistrationState() {
    return await SecureStorage.database.get(CART_KEYS.REGISTRATION_STATE);
  }

  // Save registration state securely
  async saveRegistrationState(registrationState) {
    await SecureStorage.database.store(CART_KEYS.REGISTRATION_STATE, registrationState, {
      expires: 24 * 60 * 60 * 1000 // 24 hours
    });
  }

  // Get session flags securely
  async getSessionFlag(key) {
    return await SecureStorage.session.get(key);
  }

  // Set session flags securely
  async setSessionFlag(key, value) {
    await SecureStorage.session.set(key, value, { encrypt: false, expires: 60 * 60 * 1000 });
  }

  // Remove session flags securely
  async removeSessionFlag(key) {
    SecureStorage.session.remove(key);
  }

  // Clear all cart data securely
  async clearCartData() {
    await Promise.all([
      SecureStorage.database.delete(CART_KEYS.CART_STATE),
      SecureStorage.database.delete(CART_KEYS.PURCHASES),
      SecureStorage.database.delete(CART_KEYS.REGISTRATION_STATE),
      SecureStorage.session.remove(CART_KEYS.USER_EMAIL),
      SecureStorage.session.remove(CART_KEYS.FIRST_NAME),
      SecureStorage.session.remove(CART_KEYS.LAST_NAME),
      SecureStorage.session.remove(CART_KEYS.BILLING_DETAILS),
      SecureStorage.session.remove(CART_KEYS.HAS_PROCEED_BEEN_CLICKED),
      SecureStorage.session.remove(CART_KEYS.PAYMENT_PROCESSING),
      SecureStorage.session.remove(CART_KEYS.EULA_ACCEPTED),
      SecureStorage.session.remove(CART_KEYS.SELECTED_USAGE),
      SecureStorage.session.remove(CART_KEYS.LAST_FONT_SELECTION)
    ]);
  }

  // Check if secure storage is available
  isSecureStorageAvailable() {
    return this.isSecureAvailable;
  }
}

// Create singleton instance
const secureCartStorage = new SecureCartStorage();

export default secureCartStorage;
export { CART_KEYS }; 