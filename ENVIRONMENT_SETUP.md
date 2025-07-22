# Environment Setup Guide

This guide explains how to set up environment variables for both development and production environments.

## Development Environment (.env.local)

Create a `.env.local` file in your project root for local development:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Base URL for local development (optional - will auto-detect)
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# Other environment variables as needed
```

## Production Environment

For production deployment, set these environment variables in your hosting platform:

### Vercel
1. Go to your project dashboard
2. Navigate to Settings → Environment Variables
3. Add the following variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_BASE_URL=https://your-domain.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

### Netlify
1. Go to Site settings → Environment variables
2. Add the same variables as above

### Other Platforms
Set the same environment variables in your hosting platform's environment configuration.

## Supabase Configuration

### Auth Settings
1. Go to your Supabase project dashboard
2. Navigate to Authentication → URL Configuration
3. Set the following URLs:

**Site URL:**
- Development: `http://localhost:3000`
- Production: `https://your-domain.com`

**Redirect URLs:**
- Development: `http://localhost:3000/auth/callback`
- Production: `https://your-domain.com/auth/callback`

**Additional Redirect URLs (if needed):**
- `http://localhost:3000/reset-password`
- `https://your-domain.com/reset-password`

### Email Templates
1. Go to Authentication → Email Templates
2. Update the confirmation email template to use the correct redirect URL
3. The system will automatically use the correct URL based on the environment

## How It Works

The application automatically detects the environment and uses the appropriate URLs:

1. **Development**: Uses `http://localhost:3000` (auto-detected from `window.location.origin`)
2. **Production**: Uses `NEXT_PUBLIC_BASE_URL` environment variable

The `getAuthCallbackUrl()` utility function handles this automatically:

```javascript
// Automatically returns the correct URL for the current environment
const redirectUrl = getAuthCallbackUrl();
// Development: "http://localhost:3000/auth/callback"
// Production: "https://your-domain.com/auth/callback"
```

## Testing

To test the setup:

1. **Development**: Run `npm run dev` and test auth flows
2. **Production**: Deploy and test auth flows on your live site

The system will log environment information to help with debugging:

```javascript
// Check browser console for environment info
console.log('🌍 Environment Info:', {
  isProduction: process.env.NODE_ENV === 'production',
  baseUrl: getBaseUrl(),
  authCallbackUrl: getAuthCallbackUrl(),
  // ... more info
});
```

## Troubleshooting

### Common Issues

1. **Redirect URL Mismatch**: Ensure Supabase redirect URLs match your environment
2. **Environment Variable Not Set**: Check that `NEXT_PUBLIC_BASE_URL` is set in production
3. **CORS Issues**: Verify your domain is allowed in Supabase settings

### Debug Commands

```bash
# Check environment variables (development)
echo $NEXT_PUBLIC_BASE_URL

# Build and test
npm run build
npm start
```

## Security Notes

- Never commit `.env.local` files to version control
- Use different Supabase projects for development and production
- Regularly rotate API keys
- Monitor auth logs in Supabase dashboard 