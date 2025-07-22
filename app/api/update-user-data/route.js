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
    const requestData = await request.json();
    const { 
      userId,
      street_address,
      city,
      postal_code,
      country
    } = requestData;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: userId' },
        { status: 400 }
      );
    }

    console.log('Updating user billing details for:', userId);

    // Update user record
    const { data: updatedUser, error: updateError } = await supabaseService
      .from('users')
      .update({
        street_address: street_address || null,
        city: city || null,
        postal_code: postal_code || null,
        country: country || null,
        updated_at: new Date().toISOString()
      })
      .eq('auth_user_id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Database error:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update user data' },
        { status: 500 }
      );
    }

    console.log('User billing details updated successfully:', updatedUser.email);

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: 'User billing details updated successfully'
    });

  } catch (error) {
    console.error('Update user data error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 