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
      { success: false, error: 'Update service not available - missing environment variables' },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const { 
      auth_user_id, 
      email, 
      street_address, 
      city, 
      postal_code, 
      country, 
      newsletter_subscribed 
    } = body;

    console.log('Updating user data for:', { auth_user_id, email });
    console.log('Using service role key:', !!supabaseServiceKey);

    if (!auth_user_id) {
      return Response.json(
        { error: 'Missing required auth_user_id' },
        { status: 400 }
      );
    }

    // Update user record in database
    const { data: updatedUser, error: updateError } = await supabaseService
      .from('users')
      .update({
        email,
        street_address,
        city,
        postal_code,
        country,
        newsletter_subscribed,
        updated_at: new Date().toISOString()
      })
      .eq('auth_user_id', auth_user_id)
      .select()
      .single();

    if (updateError) {
      console.error('Database error:', updateError);
      return Response.json(
        { 
          error: 'Failed to update user data', 
          details: updateError 
        },
        { status: 500 }
      );
    }

    console.log('Successfully updated user:', updatedUser.email);
    return Response.json({ 
      success: true, 
      user: updatedUser 
    });

  } catch (error) {
    console.error('Update user data error:', error);
    return Response.json(
      { 
        error: 'Failed to update user data', 
        details: {
          message: error.message,
          details: error.stack,
          hint: error.hint || '',
          code: error.code || ''
        }
      },
      { status: 500 }
    );
  }
} 