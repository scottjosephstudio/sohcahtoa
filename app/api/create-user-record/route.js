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
    const userData = await request.json();
    const { 
      auth_user_id, 
      email, 
      first_name, 
      last_name,
      street_address,
      city,
      postal_code,
      country,
      newsletter_subscribed
    } = userData;

    console.log('🔍 CREATE-USER-RECORD API received data:', {
      auth_user_id,
      email,
      first_name,
      last_name,
      street_address,
      city,
      postal_code,
      country,
      newsletter_subscribed,
      fullUserData: userData
    });

    if (!auth_user_id || !email) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: auth_user_id and email' },
        { status: 400 }
      );
    }

    console.log('Creating user record for:', { auth_user_id, email });
    console.log('Using service role key:', !!supabaseServiceKey);

    // First check if user already exists by auth_user_id
    const { data: existingUser, error: checkError } = await supabaseService
      .from('users')
      .select('*')
      .eq('auth_user_id', auth_user_id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing user:', checkError);
      return NextResponse.json(
        { success: false, error: 'Error checking existing user' },
        { status: 500 }
      );
    }

    if (existingUser) {
      console.log('⚠️ CREATE-USER-RECORD API: User already exists, updating with new data:', {
        email: existingUser.email,
        id: existingUser.id,
        existing_street_address: existingUser.street_address,
        existing_city: existingUser.city,
        existing_postal_code: existingUser.postal_code,
        existing_country: existingUser.country,
        new_street_address: street_address,
        new_city: city,
        new_postal_code: postal_code,
        new_country: country
      });

      // Update existing user with new billing details
      const { data: updatedUser, error: updateError } = await supabaseService
        .from('users')
        .update({
          first_name: first_name || existingUser.first_name,
          last_name: last_name || existingUser.last_name,
          street_address: street_address || existingUser.street_address,
          city: city || existingUser.city,
          postal_code: postal_code || existingUser.postal_code,
          country: country || existingUser.country,
          newsletter_subscribed: newsletter_subscribed !== undefined ? newsletter_subscribed : existingUser.newsletter_subscribed,
          updated_at: new Date().toISOString()
        })
        .eq('auth_user_id', auth_user_id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating existing user:', updateError);
        return NextResponse.json(
          { success: false, error: 'Failed to update existing user' },
          { status: 500 }
        );
      }

      console.log('✅ CREATE-USER-RECORD API: Existing user updated successfully:', {
        email: updatedUser.email,
        id: updatedUser.id,
        street_address: updatedUser.street_address,
        city: updatedUser.city,
        postal_code: updatedUser.postal_code,
        country: updatedUser.country
      });

      return NextResponse.json({
        success: true,
        user: updatedUser,
        message: 'Existing user updated with new data'
      });
    }

    // Create user record
    const insertData = {
      auth_user_id,
      email,
      first_name: first_name || '',
      last_name: last_name || '',
      street_address: street_address || '',
      city: city || '',
      postal_code: postal_code || '',
      country: country || '',
      newsletter_subscribed: newsletter_subscribed || false,
      email_verified: false,
      is_active: true
    };

    console.log('🔍 CREATE-USER-RECORD API inserting data:', insertData);

    const { data: newUser, error: createError } = await supabaseService
      .from('users')
      .insert([insertData])
      .select()
      .single();

    if (createError) {
      // Handle duplicate email error specifically - don't log this as it's expected
      if (createError.code === '23505' && createError.message.includes('email')) {
        return NextResponse.json(
          { success: false, error: 'An account with this email already exists' },
          { status: 409 }
        );
      }
      
      // Log other database errors
      console.error('Database error:', createError);
      return NextResponse.json(
        { success: false, error: 'Failed to create user record', details: createError },
        { status: 500 }
      );
    }

    console.log('✅ CREATE-USER-RECORD API successfully created user:', {
      email: newUser.email,
      id: newUser.id,
      street_address: newUser.street_address,
      city: newUser.city,
      postal_code: newUser.postal_code,
      country: newUser.country,
      fullUserData: newUser
    });

    return NextResponse.json({
      success: true,
      user: newUser
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
} 