import { createClient } from '@supabase/supabase-js';

// Use service role key for admin operations to bypass RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function GET(request) {
  return Response.json({ 
    message: 'Populate fonts API is working. Use POST to add JANT font.',
    timestamp: new Date().toISOString(),
    hasServiceKey: !!supabaseServiceKey
  });
}

export async function POST(request) {
  try {
    console.log('Starting JANT font population...');
    
    // Check if we have the service role key
    if (!supabaseServiceKey) {
      console.error('SUPABASE_SERVICE_ROLE_KEY is not set');
      return Response.json({ 
        error: 'Service role key not configured. Please add SUPABASE_SERVICE_ROLE_KEY to your environment variables.' 
      }, { status: 500 });
    }

    // Create admin client with service role key to bypass RLS
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // Check if JANT already exists
    const { data: existingJant, error: checkError } = await supabaseAdmin
      .from('font_families')
      .select('id, name, slug')
      .eq('slug', 'jant')
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking for existing JANT font:', checkError);
      return Response.json({ 
        error: 'Error checking existing fonts', 
        details: checkError 
      }, { status: 500 });
    }
    
    if (existingJant) {
      console.log('JANT font already exists:', existingJant);
      return Response.json({ 
        success: true, 
        message: 'JANT font already exists in database',
        data: existingJant
      });
    }

    // JANT font family data
    const jantFontFamily = {
      name: 'JANT',
      slug: 'jant',
      description: 'Revival of universal case based on teaching children to draw letters of alphabet by Jan Tschichold.',
      designer: 'Scott Joseph',
      foundry: 'Soh Cah Toa',
      release_date: '2026-01-01',
      is_active: true,
      featured: true,
      sort_order: 1,
      character_sets: {
        latin: true,
        extended_latin: true
      },
      opentype_features: [
        'kern',
        'liga',
        'clig'
      ],
      preview_text: 'The quick brown fox jumps over the lazy dog'
    };

    // Create font family using admin client
    console.log('Creating JANT font family...');
    const { data: fontFamily, error: familyError } = await supabaseAdmin
      .from('font_families')
      .insert([jantFontFamily])
      .select()
      .single();

    if (familyError) {
      console.error('Error creating font family:', familyError);
      return Response.json({ 
        error: 'Failed to create font family', 
        details: familyError 
      }, { status: 500 });
    }

    console.log('Font family created successfully:', fontFamily);

    // JANT font style data
    const jantFontStyle = {
      font_family_id: fontFamily.id,
      name: 'Regular',
      slug: 'regular',
      weight: 400,
      style: 'normal',
      is_active: true,
      font_files: {
        otf: '/fonts/JANTReg.otf',
        ttf: '/fonts/JANTReg.ttf',
        woff: '/fonts/JANTReg.woff',
        woff2: '/fonts/JANTReg.woff2'
      },
      metrics: {
        units_per_em: 1000,
        ascender: 800,
        descender: -200,
        line_gap: 0,
        cap_height: 700,
        x_height: 500
      },
      glyph_count: 256,
      supported_languages: [
        'en', 'es', 'fr', 'de', 'it', 'pt', 'nl', 'da', 'sv', 'no'
      ]
    };

    // Create font style using admin client
    console.log('Creating JANT font style...');
    const { data: fontStyle, error: styleError } = await supabaseAdmin
      .from('font_styles')
      .insert([jantFontStyle])
      .select()
      .single();

    if (styleError) {
      console.error('Error creating font style:', styleError);
      return Response.json({ 
        error: 'Failed to create font style', 
        details: styleError 
      }, { status: 500 });
    }

    console.log('Font style created successfully:', fontStyle);

    // Verify the complete font data
    const { data: verifyFamily, error: verifyError } = await supabaseAdmin
      .from('font_families')
      .select(`
        *,
        font_styles (*)
      `)
      .eq('slug', 'jant')
      .single();

    if (verifyError) {
      console.error('Error verifying font data:', verifyError);
      return Response.json({ 
        error: 'Failed to verify font data', 
        details: verifyError 
      }, { status: 500 });
    }

    console.log('JANT font population completed successfully!');
    
    return Response.json({ 
      success: true, 
      message: 'JANT font successfully added to database',
      data: {
        family: fontFamily,
        style: fontStyle,
        verification: verifyFamily
      }
    });

  } catch (error) {
    console.error('Unexpected error in populate-fonts:', error);
    return Response.json({ 
      error: 'Unexpected error occurred', 
      details: error.message 
    }, { status: 500 });
  }
} 