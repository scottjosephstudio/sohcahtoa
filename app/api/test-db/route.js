import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/database/supabaseClient';

export async function GET() {
  try {
    // Test basic database connection with a simple query
    const { data, error } = await supabase
      .from('font_families')
      .select('id, name, slug')
      .eq('is_active', true)
      .limit(5);
    
    if (error) {
      return NextResponse.json(
        { 
          success: false, 
          error: error.message,
          message: 'Database connection failed',
          details: error
        },
        { status: 500 }
      );
    }

    // Test if we can also query font_styles separately
    const { data: stylesData, error: stylesError } = await supabase
      .from('font_styles')
      .select('id, name, font_family_id')
      .eq('is_active', true)
      .limit(5);

    return NextResponse.json({
      success: true,
      message: 'Database connection successful!',
      fontFamilies: data?.length || 0,
      fontStyles: stylesData?.length || 0,
      sampleFontFamily: data?.[0] || null,
      sampleFontStyle: stylesData?.[0] || null,
      stylesQuerySuccess: !stylesError
    });

  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        message: 'Database test failed',
        stack: error.stack
      },
      { status: 500 }
    );
  }
} 