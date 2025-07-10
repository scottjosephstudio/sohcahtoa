# Production Flow Testing Guide

## Overview
This guide walks through testing the complete production-ready cart flow with payment processing, database integration, and font downloads.

## Prerequisites
1. ✅ Development server running (`npm run dev`)
2. ✅ Supabase database configured
3. ✅ Database schema applied (`database/schema.sql`)
4. ✅ Font data seeded (`database/seed-fonts.sql`)

## Testing Steps

### 1. Database Setup
Run these SQL commands in your Supabase SQL editor:

```sql
-- First, run the main schema
-- Copy and paste the contents of database/schema.sql

-- Then, seed with font data
-- Copy and paste the contents of database/seed-fonts.sql
```

### 2. Registration & Email Verification

**Test Registration:**
1. Go to any typeface page (e.g., `/ID/jant`)
2. Add a font to cart
3. Click "Add to Cart" → "Checkout"
4. Fill in registration form with a real email
5. Submit registration

**Expected Result:**
- User account created in Supabase Auth
- User record created in `users` table
- Email verification logged to console (development mode)
- Console shows verification URL for testing

**Test Email Verification:**
1. Copy verification URL from console logs
2. Open URL in browser
3. Should see "Email verified successfully" message

### 3. Complete Purchase Flow

**Test Cart & Payment:**
1. Add fonts to cart (test both single and multi-font selection)
2. Select usage type (Personal/Client)
3. Choose license package or custom licenses
4. Accept EULA
5. Enter payment details (use Stripe test card: `4242 4242 4242 4242`)
6. Complete payment

**Expected Database Changes:**
```sql
-- Check purchase was recorded
SELECT * FROM purchase_orders WHERE user_id = 'YOUR_USER_ID';

-- Check purchase items
SELECT * FROM purchase_items WHERE purchase_order_id = 'ORDER_ID';

-- Check user licenses were created
SELECT * FROM user_licenses WHERE user_id = 'YOUR_USER_ID';
```

### 4. Download Functionality

**Test Downloads:**
1. After successful purchase, login to user dashboard
2. Navigate to "Available Downloads" section
3. Click download buttons for different formats (OTF, WOFF, TTF)
4. Verify files download correctly

**Expected Behavior:**
- Download tokens generated in `font_downloads` table
- Secure download URLs created
- Files served with proper headers
- Download history tracked

### 5. API Endpoints Testing

**Test Purchase Processing:**
```bash
# Test payment intent creation
curl -X POST http://localhost:3003/api/create-payment-intent \
  -H "Content-Type: application/json" \
  -d '{"amount": 30.00, "currency": "gbp"}'

# Should return: {"clientSecret": "pi_xxx", "paymentIntentId": "pi_xxx"}
```

**Test Email Verification:**
```bash
# Test verification email sending
curl -X POST http://localhost:3003/api/send-verification-email \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "firstName": "Test", "verificationToken": "test-token"}'

# Should return: {"success": true, "verificationUrl": "..."}
```

## Development vs Production

### Development Mode Features:
- Email verification URLs logged to console
- Mock payment processing
- Simplified download flow

### Production Mode Requirements:
- Real email service integration (SendGrid, Mailgun, etc.)
- Stripe live keys
- Production Supabase instance
- CDN for font file serving

## Troubleshooting

### Common Issues:

**Database Connection:**
- Check Supabase URL and keys in `.env.local`
- Verify database schema is applied
- Check RLS policies allow operations

**Payment Issues:**
- Verify Stripe publishable/secret keys
- Check payment intent creation logs
- Ensure cart data is properly formatted

**Download Issues:**
- Check font files exist in `/public/fonts/`
- Verify user licenses were created
- Check download token generation

**Email Verification:**
- Check console logs for verification URLs
- Verify Supabase auth settings
- Test with different email addresses

## Success Criteria

✅ **Registration:** User can create account and receive verification email
✅ **Payment:** Stripe payment completes successfully  
✅ **Database:** Purchase orders, items, and licenses created
✅ **Downloads:** User can download purchased fonts
✅ **Security:** Download tokens expire and are rate-limited

## Next Steps for Production

1. **Email Service:** Integrate SendGrid/Mailgun for real emails
2. **Font CDN:** Move font files to CDN for better performance
3. **Monitoring:** Add error tracking and analytics
4. **Testing:** Add automated test suite
5. **Security:** Security audit and penetration testing 