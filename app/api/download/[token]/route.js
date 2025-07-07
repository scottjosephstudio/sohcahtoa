import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/database/supabaseClient';
import { createReadStream, existsSync } from 'fs';
import { join } from 'path';
import { headers } from 'next/headers';

// =============================================
// SECURE FONT DOWNLOAD ENDPOINT
// =============================================

export async function GET(request, { params }) {
  try {
    const { token } = params;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Download token required' },
        { status: 400 }
      );
    }

    // Get client information
    const headersList = headers();
    const userAgent = headersList.get('user-agent') || '';
    const forwardedFor = headersList.get('x-forwarded-for');
    const realIP = headersList.get('x-real-ip');
    const clientIP = forwardedFor || realIP || 'unknown';

    // Verify download token and get download record
    const { data: downloadRecord, error: downloadError } = await supabase
      .from('font_downloads')
      .select(`
        *,
        user_licenses!inner(
          id,
          is_active,
          expires_at,
          users!inner(
            id,
            email,
            is_active
          )
        ),
        font_styles!inner(
          id,
          name,
          slug,
          font_files,
          font_families!inner(
            id,
            name,
            slug
          )
        )
      `)
      .eq('download_token', token)
      .eq('user_licenses.is_active', true)
      .eq('users.is_active', true)
      .single();

    if (downloadError || !downloadRecord) {
      return NextResponse.json(
        { error: 'Invalid or expired download token' },
        { status: 404 }
      );
    }

    // Check if download token has expired
    if (new Date(downloadRecord.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Download link has expired' },
        { status: 410 }
      );
    }

    // Check if user license has expired
    const userLicense = downloadRecord.user_licenses;
    if (userLicense.expires_at && new Date(userLicense.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'License has expired' },
        { status: 403 }
      );
    }

    // Get font file information
    const fontStyle = downloadRecord.font_styles;
    const fontFiles = fontStyle.font_files;
    const requestedFormat = downloadRecord.file_format;

    if (!fontFiles || !fontFiles[requestedFormat]) {
      return NextResponse.json(
        { error: 'Font file not available in requested format' },
        { status: 404 }
      );
    }

    // Get file path
    const filePath = fontFiles[requestedFormat];
    const fullPath = join(process.cwd(), 'public', filePath);

    // Check if file exists
    if (!existsSync(fullPath)) {
      console.error(`Font file not found: ${fullPath}`);
      return NextResponse.json(
        { error: 'Font file not found on server' },
        { status: 404 }
      );
    }

    // Log the download
    await logDownloadEvent(downloadRecord, clientIP, userAgent);

    // Generate filename
    const fontFamily = fontStyle.font_families;
    const filename = `${fontFamily.slug}-${fontStyle.slug}.${requestedFormat}`;

    // Read file and return as response
    try {
      const fileBuffer = await import('fs/promises').then(fs => fs.readFile(fullPath));
      
      // Set appropriate headers
      const response = new NextResponse(fileBuffer);
      
      // Set content type based on file format
      const contentTypes = {
        'woff2': 'font/woff2',
        'woff': 'font/woff',
        'ttf': 'font/ttf',
        'otf': 'font/otf',
        'zip': 'application/zip'
      };
      
      response.headers.set('Content-Type', contentTypes[requestedFormat] || 'application/octet-stream');
      response.headers.set('Content-Disposition', `attachment; filename="${filename}"`);
      response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '0');
      
      return response;

    } catch (fileError) {
      console.error('Error reading font file:', fileError);
      return NextResponse.json(
        { error: 'Error reading font file' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Download endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// =============================================
// HELPER FUNCTIONS
// =============================================

async function logDownloadEvent(downloadRecord, clientIP, userAgent) {
  try {
    // Update download record with actual download info
    await supabase
      .from('font_downloads')
      .update({
        ip_address: clientIP,
        user_agent: userAgent,
        downloaded_at: new Date().toISOString()
      })
      .eq('id', downloadRecord.id);

    // Log audit event
    await supabase
      .from('audit_log')
      .insert([{
        user_id: downloadRecord.user_licenses.users.id,
        action: 'font_downloaded',
        entity_type: 'font_download',
        entity_id: downloadRecord.id,
        new_values: {
          font_style_id: downloadRecord.font_style_id,
          file_format: downloadRecord.file_format,
          download_token: downloadRecord.download_token
        },
        ip_address: clientIP,
        user_agent: userAgent
      }]);

  } catch (error) {
    console.error('Error logging download event:', error);
    // Don't fail the download if logging fails
  }
}

// Rate limiting helper (optional)
async function checkRateLimit(userId, clientIP) {
  try {
    // Check downloads in last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const { data, error } = await supabase
      .from('font_downloads')
      .select('id')
      .eq('user_id', userId)
      .gte('downloaded_at', oneHourAgo.toISOString());

    if (error) {
      console.error('Rate limit check error:', error);
      return true; // Allow download if check fails
    }

    // Allow up to 50 downloads per hour per user
    return data.length < 50;

  } catch (error) {
    console.error('Rate limit error:', error);
    return true; // Allow download if check fails
  }
}

export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
} 