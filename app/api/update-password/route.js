import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request) {
  try {
    const { userId, newPassword } = await request.json();

    if (!userId || !newPassword) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    console.log('🔄 Updating password for user:', userId);

    // Use service role client for admin operations
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseServiceKey) {
      console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    // Update the user's password using admin privileges
    const { data, error } = await supabase.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    );

    if (error) {
      console.error('❌ Password update error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        status: error.status,
        name: error.name,
        stack: error.stack
      });
      return NextResponse.json(
        { error: error.message || 'Failed to update password' },
        { status: 500 }
      );
    }

    console.log('✅ Password updated successfully for user:', data.user?.email);

    // Update the database record
    try {
      const { error: dbError } = await supabase
        .from('users')
        .update({ 
          password_updated_at: new Date().toISOString()
        })
        .eq('auth_user_id', userId);
        
      if (dbError) {
        console.warn('⚠️ Database update failed (non-critical):', dbError);
      }
    } catch (dbError) {
      console.warn('⚠️ Database update exception (non-critical):', dbError);
    }

    return NextResponse.json(
      { success: true, message: 'Password updated successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('❌ Password update API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 