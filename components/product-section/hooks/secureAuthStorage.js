/**
 * Secure Auth Storage
 * Wraps authentication storage operations with secure storage instead of localStorage
 */

import SecureStorage from '../../../lib/secureStorage.js';

// Auth-specific storage keys
const AUTH_KEYS = {
  SAVED_REGISTRATION_DATA: 'savedRegistrationData',
  PASSWORD_RESET_COMPLETED: 'passwordResetCompleted',
  NEWSLETTER_EMAILS: 'newsletter_emails'
};

class SecureAuthStorage {
  constructor() {
    this.isSecureAvailable = SecureStorage.isSecureStorageAvailable();
  }

  // Get saved registration data securely
  async getSavedRegistrationData() {
    return await SecureStorage.database.get(AUTH_KEYS.SAVED_REGISTRATION_DATA);
  }

  // Save registration data securely
  async saveRegistrationData(registrationData) {
    await SecureStorage.database.store(AUTH_KEYS.SAVED_REGISTRATION_DATA, registrationData, {
      expires: 24 * 60 * 60 * 1000 // 24 hours
    });
  }

  // Get password reset completion status
  async getPasswordResetCompleted() {
    return await SecureStorage.session.get(AUTH_KEYS.PASSWORD_RESET_COMPLETED);
  }

  // Set password reset completion status
  async setPasswordResetCompleted(completed) {
    await SecureStorage.session.set(AUTH_KEYS.PASSWORD_RESET_COMPLETED, completed, {
      encrypt: false,
      expires: 60 * 60 * 1000 // 1 hour
    });
  }

  // Remove password reset completion status
  async removePasswordResetCompleted() {
    SecureStorage.session.remove(AUTH_KEYS.PASSWORD_RESET_COMPLETED);
  }

  // Get newsletter emails securely
  async getNewsletterEmails() {
    const emails = await SecureStorage.database.get(AUTH_KEYS.NEWSLETTER_EMAILS);
    return emails || [];
  }

  // Save newsletter emails securely
  async saveNewsletterEmails(emails) {
    await SecureStorage.database.store(AUTH_KEYS.NEWSLETTER_EMAILS, emails, {
      expires: 30 * 24 * 60 * 60 * 1000 // 30 days
    });
  }

  // Registration email sent flag
  async getRegistrationEmailSent(email) {
    if (!email) return false;
    return await SecureStorage.session.get(`registrationEmailSent:${email}`);
  }
  async setRegistrationEmailSent(email) {
    if (!email) return;
    // Set with 1 hour expiry
    await SecureStorage.session.set(`registrationEmailSent:${email}`, { sent: true, ts: Date.now() }, { encrypt: true, expires: 60 * 60 * 1000 });
  }
  async clearRegistrationEmailSent(email) {
    if (!email) return;
    await SecureStorage.session.remove(`registrationEmailSent:${email}`);
  }
  // Reset email sent flag
  async getResetEmailSent(email) {
    if (!email) return false;
    return await SecureStorage.session.get(`resetEmailSent:${email}`);
  }
  async setResetEmailSent(email) {
    if (!email) return;
    // Set with 1 hour expiry
    await SecureStorage.session.set(`resetEmailSent:${email}`, { sent: true, ts: Date.now() }, { encrypt: true, expires: 60 * 60 * 1000 });
  }
  async clearResetEmailSent(email) {
    if (!email) return;
    await SecureStorage.session.remove(`resetEmailSent:${email}`);
  }

  // Clear all auth data securely
  async clearAuthData() {
    await Promise.all([
      SecureStorage.database.delete(AUTH_KEYS.SAVED_REGISTRATION_DATA),
      SecureStorage.database.delete(AUTH_KEYS.NEWSLETTER_EMAILS),
      SecureStorage.session.remove(AUTH_KEYS.PASSWORD_RESET_COMPLETED)
    ]);
  }

  // Check if secure storage is available
  isSecureStorageAvailable() {
    return this.isSecureAvailable;
  }
}

// Create singleton instance
const secureAuthStorage = new SecureAuthStorage();

export default secureAuthStorage;
export { AUTH_KEYS }; 