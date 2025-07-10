import { NextResponse } from 'next/server';
import FontSecurity from '../../../lib/fontSecurity';
import { createClient } from '@supabase/supabase-js';

// Check if required environment variables are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabaseService = null;
let fontSecurity = null;

if (supabaseUrl && supabaseServiceKey) {
  supabaseService = createClient(supabaseUrl, supabaseServiceKey);
  fontSecurity = new FontSecurity();
}

export async function POST(request) {
  // Check if service is available
  if (!supabaseService || !fontSecurity) {
    return NextResponse.json(
      { error: 'Font security service not available - missing environment variables' },
      { status: 503 }
    );
  }

  try {
    const { action, ...params } = await request.json();

    switch (action) {
      case 'encrypt_font':
        return await encryptFont(params);
      case 'migrate_public_fonts':
        return await migratePublicFonts();
      case 'verify_integrity':
        return await verifyIntegrity(params);
      case 'cleanup_expired':
        return await cleanupExpired(params);
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Secure fonts API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function encryptFont({ fontFamilyId, fontStyleId, sourcePath, format }) {
  try {
    // Encrypt the font file
    const result = await fontSecurity.encryptFontFile(
      sourcePath,
      fontFamilyId,
      fontStyleId,
      format
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    // Update database with encrypted path
    const { error: updateError } = await supabaseService
      .from('font_styles')
      .update({
        font_files: {
          ...params.currentFontFiles,
          [format]: `secure:${result.encryptedPath}`
        }
      })
      .eq('id', fontStyleId);

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update database' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      encryptedPath: result.encryptedPath,
      originalSize: result.originalSize,
      encryptedSize: result.encryptedSize
    });

  } catch (error) {
    console.error('Font encryption error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

async function migratePublicFonts() {
  try {
    console.log('Starting font migration...');
    
    // Get all font styles from database
    const { data: fontStyles, error: fontError } = await supabaseService
      .from('font_styles')
      .select(`
        id,
        font_files,
        font_families (
          id,
          slug
        )
      `);

    if (fontError) {
      return NextResponse.json(
        { error: 'Failed to fetch font styles' },
        { status: 500 }
      );
    }

    const migrationResults = [];

    for (const fontStyle of fontStyles) {
      const fontFiles = fontStyle.font_files || {};
      const updatedFontFiles = { ...fontFiles };
      let hasUpdates = false;

      for (const [format, filePath] of Object.entries(fontFiles)) {
        // Skip already encrypted files
        if (filePath.startsWith('secure:')) {
          continue;
        }

        // Convert public path to full path
        const fullPath = require('path').join(process.cwd(), 'public', filePath);
        
        // Check if file exists
        if (!require('fs').existsSync(fullPath)) {
          console.warn(`Font file not found: ${fullPath}`);
          continue;
        }

        // Encrypt the font file
        const encryptResult = await fontSecurity.encryptFontFile(
          fullPath,
          fontStyle.font_families.id,
          fontStyle.id,
          format
        );

        if (encryptResult.success) {
          updatedFontFiles[format] = `secure:${encryptResult.encryptedPath}`;
          hasUpdates = true;
          
          migrationResults.push({
            fontStyleId: fontStyle.id,
            format: format,
            originalPath: filePath,
            encryptedPath: encryptResult.encryptedPath,
            status: 'success'
          });
        } else {
          migrationResults.push({
            fontStyleId: fontStyle.id,
            format: format,
            originalPath: filePath,
            error: encryptResult.error,
            status: 'failed'
          });
        }
      }

      // Update database if we have changes
      if (hasUpdates) {
        const { error: updateError } = await supabaseService
          .from('font_styles')
          .update({ font_files: updatedFontFiles })
          .eq('id', fontStyle.id);

        if (updateError) {
          console.error(`Failed to update font style ${fontStyle.id}:`, updateError);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Font migration completed',
      results: migrationResults
    });

  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

async function verifyIntegrity({ fontStyleId, format }) {
  try {
    // Get font style data
    const { data: fontStyle, error: fontError } = await supabaseService
      .from('font_styles')
      .select(`
        id,
        font_files,
        font_families (
          id,
          slug
        )
      `)
      .eq('id', fontStyleId)
      .single();

    if (fontError || !fontStyle) {
      return NextResponse.json(
        { error: 'Font style not found' },
        { status: 404 }
      );
    }

    const filePath = fontStyle.font_files[format];
    if (!filePath || !filePath.startsWith('secure:')) {
      return NextResponse.json(
        { error: 'Font file not encrypted' },
        { status: 400 }
      );
    }

    const encryptedFilename = filePath.replace('secure:', '');
    
    const verification = await fontSecurity.verifyFontIntegrity(
      encryptedFilename,
      fontStyle.font_families.id,
      fontStyle.id
    );

    return NextResponse.json({
      success: true,
      verification: verification
    });

  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

async function cleanupExpired({ maxAge = 30 * 24 * 60 * 60 * 1000 }) {
  try {
    const result = await fontSecurity.cleanupExpiredFiles(maxAge);
    
    return NextResponse.json({
      success: true,
      cleanedCount: result.cleanedCount
    });

  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Secure fonts API is working',
    timestamp: new Date().toISOString(),
    serviceAvailable: !!(supabaseService && fontSecurity),
    endpoints: {
      'POST /api/secure-fonts': {
        actions: [
          'encrypt_font',
          'migrate_public_fonts',
          'verify_integrity',
          'cleanup_expired'
        ]
      }
    }
  });
} 