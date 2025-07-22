/**
 * Test Secure Storage in Development
 * Run this script to test the secure storage implementation
 */

import SecureStorage from '../lib/secureStorage.js';
import secureCartStorage from '../components/cart/Utils/secureCartStorage.js';
import secureAuthStorage from '../components/product-section/hooks/secureAuthStorage.js';

const testSecureStorage = async () => {
  console.log('🧪 Testing Secure Storage Implementation...\n');

  // Test 1: Check if secure storage is available
  console.log('1. Checking secure storage availability...');
  const isAvailable = SecureStorage.isSecureStorageAvailable();
  console.log(`   Secure storage available: ${isAvailable ? '✅' : '❌'}\n`);

  if (!isAvailable) {
    console.log('⚠️  Secure storage not available, using localStorage fallback');
    return;
  }

  // Test 2: Test session storage
  console.log('2. Testing session storage...');
  try {
    await SecureStorage.session.set('test_session', { message: 'Hello from session storage' }, { encrypt: true });
    const sessionData = await SecureStorage.session.get('test_session');
    console.log(`   Session storage test: ${sessionData?.message === 'Hello from session storage' ? '✅' : '❌'}`);
    
    // Test expiration
    await SecureStorage.session.set('test_expire', { message: 'This will expire' }, { expires: 1000 }); // 1 second
    await new Promise(resolve => setTimeout(resolve, 1100));
    const expiredData = await SecureStorage.session.get('test_expire');
    console.log(`   Expiration test: ${expiredData === null ? '✅' : '❌'}`);
  } catch (error) {
    console.log(`   Session storage test: ❌ Error: ${error.message}`);
  }
  console.log('');

  // Test 3: Test IndexedDB storage
  console.log('3. Testing IndexedDB storage...');
  try {
    await SecureStorage.database.store('test_db', { message: 'Hello from IndexedDB' }, { expires: 60000 }); // 1 minute
    const dbData = await SecureStorage.database.get('test_db');
    console.log(`   IndexedDB storage test: ${dbData?.message === 'Hello from IndexedDB' ? '✅' : '❌'}`);
  } catch (error) {
    console.log(`   IndexedDB storage test: ❌ Error: ${error.message}`);
  }
  console.log('');

  // Test 4: Test cart storage wrapper
  console.log('4. Testing cart storage wrapper...');
  try {
    const testCartData = {
      selectedFont: { name: 'Test Font', id: 'test-123' },
      selectedPackage: 'personal',
      totalPrice: 2500
    };
    
    await secureCartStorage.saveCartState(testCartData);
    const retrievedCart = await secureCartStorage.getCartState();
    console.log(`   Cart storage test: ${retrievedCart?.selectedFont?.name === 'Test Font' ? '✅' : '❌'}`);
    
    // Test user data
    await secureCartStorage.saveUserData({
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe'
    });
    const userData = await secureCartStorage.getUserData();
    console.log(`   User data test: ${userData?.email === 'test@example.com' ? '✅' : '❌'}`);
  } catch (error) {
    console.log(`   Cart storage test: ❌ Error: ${error.message}`);
  }
  console.log('');

  // Test 5: Test auth storage wrapper
  console.log('5. Testing auth storage wrapper...');
  try {
    const testRegistrationData = {
      email: 'auth@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      street: '123 Test St',
      city: 'Test City'
    };
    
    await secureAuthStorage.saveRegistrationData(testRegistrationData);
    const retrievedRegData = await secureAuthStorage.getSavedRegistrationData();
    console.log(`   Auth storage test: ${retrievedRegData?.email === 'auth@example.com' ? '✅' : '❌'}`);
    
    // Test password reset flag
    await secureAuthStorage.setPasswordResetCompleted(true);
    const resetCompleted = await secureAuthStorage.getPasswordResetCompleted();
    console.log(`   Password reset flag test: ${resetCompleted === true ? '✅' : '❌'}`);
  } catch (error) {
    console.log(`   Auth storage test: ❌ Error: ${error.message}`);
  }
  console.log('');

  // Test 6: Test migration from localStorage
  console.log('6. Testing migration from localStorage...');
  try {
    // Set some test data in localStorage
    localStorage.setItem('test_migration_key', JSON.stringify({ migrated: true }));
    
    await SecureStorage.migrateFromLocalStorage(['test_migration_key']);
    
    const migratedData = await SecureStorage.session.get('test_migration_key');
    const localStorageData = localStorage.getItem('test_migration_key');
    
    console.log(`   Migration test: ${migratedData?.migrated === true && !localStorageData ? '✅' : '❌'}`);
  } catch (error) {
    console.log(`   Migration test: ❌ Error: ${error.message}`);
  }
  console.log('');

  // Cleanup
  console.log('7. Cleaning up test data...');
  try {
    await SecureStorage.session.remove('test_session');
    await SecureStorage.database.delete('test_db');
    await secureCartStorage.clearCartData();
    await secureAuthStorage.clearAuthData();
    console.log('   Cleanup: ✅');
  } catch (error) {
    console.log(`   Cleanup: ❌ Error: ${error.message}`);
  }

  console.log('\n🎉 Secure storage testing completed!');
};

// Run the test if this script is executed directly
if (typeof window !== 'undefined') {
  // Browser environment
  testSecureStorage().catch(console.error);
} else {
  // Node.js environment
  console.log('This script should be run in a browser environment');
}

export default testSecureStorage; 