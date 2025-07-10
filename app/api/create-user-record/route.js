import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Check if required environment variables are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabaseService = null;

if (supabaseUrl && supabaseServiceKey) {
  supabaseService = createClient(supabaseUrl, supabaseServiceKey);
}

export async function POST(request) {
  // Check if service is available
  if (!supabaseService) {
    return NextResponse.json(
      { success: false, error: 'User service not available - missing environment variables' },
      { status: 503 }
    );
  }

  try {
    const { auth_user_id, email, first_name, last_name } = await request.json();

    if (!auth_user_id || !email) {
      return Response.json(
        { error: 'Missing required fields: auth_user_id and email' },
        { status: 400 }
      );
    }

    console.log('Creating user record for:', { auth_user_id, email });
    console.log('Using service role key:', !!supabaseServiceKey);

    // Create user record
    const { data: newUser, error: createError } = await supabaseService
      .from('users')
      .insert([{
        auth_user_id,
        email,
        first_name: first_name || 'Scott',
        last_name: last_name || 'Joseph',
        street_address: '',
        city: '',
        postal_code: '',
        country: '',
        newsletter_subscribed: false,
        email_verified: true,
        is_active: true
      }])
      .select()
      .single();

    if (createError) {
      console.error('Database error:', createError);
      return Response.json(
        { error: 'Failed to create user record', details: createError },
        { status: 500 }
      );
    }

    console.log('Successfully created user:', newUser.email);

    return Response.json({
      success: true,
      user: newUser
    });

  } catch (error) {
    console.error('API error:', error);
    return Response.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
} 