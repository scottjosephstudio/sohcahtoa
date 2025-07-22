/**
 * Auth Redirect URL Utilities
 * Handles redirect URLs for authentication flows in both development and production
 */

/**
 * Get the base URL for the current environment
 * @returns {string} The base URL
 */
export const getBaseUrl = () => {
  // Debug logging
  console.log('🔍 getBaseUrl Debug:', {
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    windowOrigin: typeof window !== 'undefined' ? window.location.origin : 'undefined'
  });

  // In production, use the environment variable
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    console.log('✅ Using NEXT_PUBLIC_BASE_URL:', process.env.NEXT_PUBLIC_BASE_URL);
    return process.env.NEXT_PUBLIC_BASE_URL;
  }
  
  // Temporary hardcoded fallback for production
  if (typeof window !== 'undefined' && window.location.hostname === 'spjstudio.netlify.app') {
    console.log('✅ Using hardcoded production URL');
    return 'https://spjstudio.netlify.app';
  }
  
  // In development, use localhost
  if (typeof window !== 'undefined') {
    console.log('✅ Using window.location.origin:', window.location.origin);
    return window.location.origin;
  }
  
  // Fallback for server-side rendering
  console.log('⚠️ Using fallback localhost');
  return 'http://localhost:3000';
};

/**
 * Get the auth callback URL for the current environment
 * @returns {string} The auth callback URL
 */
export const getAuthCallbackUrl = () => {
  const baseUrl = getBaseUrl();
  const callbackUrl = `${baseUrl}/auth/callback`;
  console.log('🔗 getAuthCallbackUrl:', {
    baseUrl,
    callbackUrl,
    fullUrl: callbackUrl,
    env: process.env.NODE_ENV,
    hostname: typeof window !== 'undefined' ? window.location.hostname : 'server-side',
    stack: new Error().stack // This will show where the function is being called from
  });
  return callbackUrl;
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