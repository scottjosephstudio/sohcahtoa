import { NextResponse } from 'next/server';
import { getSupabaseClient } from '../../../lib/database/supabaseClient';
import { getAuthCallbackUrl } from '../../../lib/authRedirectUtils';

export async function POST(request) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();
    
    // Use the same redirect URL as the auth callback
    const redirectTo = getAuthCallbackUrl();
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectTo
    });

    if (error) {
      console.error('Password reset error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Password reset email sent successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Password reset API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 