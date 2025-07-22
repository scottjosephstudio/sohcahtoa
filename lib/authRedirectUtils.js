/**
 * Auth Redirect URL Utilities
 * Handles redirect URLs for authentication flows in both development and production
 */

/**
 * Get the base URL for the current environment
 * @returns {string} The base URL
 */
export const getBaseUrl = () => {
  // In production, use the environment variable
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }
  
  // In development, use localhost
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // Fallback for server-side rendering
  return 'http://localhost:3000';
};

/**
 * Get the auth callback URL for the current environment
 * @returns {string} The auth callback URL
 */
export const getAuthCallbackUrl = () => {
  const baseUrl = getBaseUrl();
  return `${baseUrl}/auth/callback`;
};

/**
 * Get the password reset URL for the current environment
 * @returns {string} The password reset URL
 */
export const getPasswordResetUrl = () => {
  const baseUrl = getBaseUrl();
  return `${baseUrl}/reset-password`;
};

/**
 * Get the home URL for the current environment
 * @returns {string} The home URL
 */
export const getHomeUrl = () => {
  const baseUrl = getBaseUrl();
  return `${baseUrl}/`;
};

/**
 * Get the cart URL with openCart parameter for the current environment
 * @returns {string} The cart URL
 */
export const getCartUrl = () => {
  const baseUrl = getBaseUrl();
  return `${baseUrl}/ID?openCart=true`;
};

/**
 * Log the current environment and URLs for debugging
 */
export const logEnvironmentInfo = () => {
  if (typeof window !== 'undefined') {
    console.log('🌍 Environment Info:', {
      isProduction: process.env.NODE_ENV === 'production',
      baseUrl: getBaseUrl(),
      authCallbackUrl: getAuthCallbackUrl(),
      passwordResetUrl: getPasswordResetUrl(),
      currentOrigin: window.location.origin,
      envBaseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'not set'
    });
  }
}; 