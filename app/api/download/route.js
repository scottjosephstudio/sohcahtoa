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
      { success: false, error: 'Download service not available - missing environment variables' },
      { status: 503 }
    );
  }

  try {
    const { userLicenseId, fontStyleId, format } = await request.json();

    console.log('🔄 Download request started:', { userLicenseId, fontStyleId, format });

    // Verify user license exists and is active
    const { data: userLicense, error: licenseError } = await supabaseService
      .from('user_licenses')
      .select('*')
      .eq('id', userLicenseId)
      .eq('font_style_id', fontStyleId)
      .eq('is_active', true)
      .single();

    if (licenseError || !userLicense) {
      console.error('❌ License verification failed:', licenseError);
      return NextResponse.json({ 
        success: false, 
        error: 'License not found or inactive' 
      }, { status: 403 });
    }

    console.log('✅ License verified:', userLicense.id);

    // Check if download token already exists
    const { data: existingToken, error: tokenError } = await supabaseService
      .from('font_downloads')
      .select('*')
      .eq('user_license_id', userLicenseId)
      .eq('font_style_id', fontStyleId)
      .eq('file_format', format)
      .eq('user_id', userLicense.user_id)
      .single();

    let downloadToken;

    if (existingToken && new Date(existingToken.expires_at) > new Date()) {
      // Use existing valid token
      downloadToken = existingToken;
      console.log('✅ Using existing download token:', downloadToken.download_token);
    } else {
      // Create new download token
      const tokenData = {
        user_id: userLicense.user_id,
        user_license_id: userLicenseId,
        font_style_id: fontStyleId,
        file_format: format,
        download_token: `${userLicenseId}-${format}-${Date.now()}`,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      };

      const { data: newToken, error: createError } = await supabaseService
        .from('font_downloads')
        .insert([tokenData])
        .select()
        .single();

      if (createError) {
        console.error('❌ Failed to create download token:', createError);
        return NextResponse.json({ 
          success: false, 
          error: 'Failed to create download token' 
        }, { status: 500 });
      }

      downloadToken = newToken;
      console.log('✅ Created new download token:', downloadToken.download_token);
    }

    // Get font file path
    const { data: fontStyle, error: fontError } = await supabaseService
      .from('font_styles')
      .select('font_files')
      .eq('id', fontStyleId)
      .single();

    if (fontError || !fontStyle?.font_files?.[format]) {
      console.error('❌ Font file not found:', fontError);
      return NextResponse.json({ 
        success: false, 
        error: 'Font file not found' 
      }, { status: 404 });
    }

    const filePath = fontStyle.font_files[format];
    console.log('✅ Font file path:', filePath);

    // Return download information
    return NextResponse.json({
      success: true,
      data: {
        download_url: `/api/download/${downloadToken.download_token}`,
        file_path: filePath,
        expires_at: downloadToken.expires_at,
        message: 'Download ready'
      }
    });

  } catch (error) {
    console.error('❌ Download API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 