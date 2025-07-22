import { createClient } from '@supabase/supabase-js';

// Use service role key for admin operations to bypass RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Font data configuration
const FONT_DATA = {
  jant: {
    family: {
      name: 'JANT',
      slug: 'jant',
      description: 'Revival of universal case typeface by Jan Tschichold based on teaching children to draw letters of alphabet.',
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
    },
    styles: [
      {
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
      }
      // Add more styles here as needed
    ]
  },
  // Add more fonts here
  // example: {
  //   family: { ... },
  //   styles: [ ... ]
  // }
};

export async function GET(request) {
  return Response.json({ 
    message: 'Populate fonts API is working. Use POST to add fonts.',
    availableFonts: Object.keys(FONT_DATA),
    timestamp: new Date().toISOString(),
    hasServiceKey: !!supabaseServiceKey
  });
}

export async function POST(request) {
  try {
    console.log('Starting font population...');
    
    // Check if we have the service role key
    if (!supabaseServiceKey) {
      console.error('SUPABASE_SERVICE_ROLE_KEY is not set');
      return Response.json({ 
        error: 'Service role key not configured. Please add SUPABASE_SERVICE_ROLE_KEY to your environment variables.' 
      }, { status: 500 });
    }

    // Create admin client with service role key to bypass RLS
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    const results = [];
    
    // Process each font in the configuration
    for (const [fontSlug, fontData] of Object.entries(FONT_DATA)) {
      console.log(`Processing font: ${fontSlug}`);
      
      // Check if font already exists
      const { data: existingFont, error: checkError } = await supabaseAdmin
        .from('font_families')
        .select('id, name, slug')
        .eq('slug', fontSlug)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error(`Error checking for existing ${fontSlug} font:`, checkError);
        results.push({ font: fontSlug, status: 'error', error: checkError });
        continue;
      }
      
      if (existingFont) {
        console.log(`${fontSlug} font already exists:`, existingFont);
        results.push({ font: fontSlug, status: 'exists', data: existingFont });
        continue;
      }

      // Create font family
      console.log(`Creating ${fontSlug} font family...`);
      const { data: fontFamily, error: familyError } = await supabaseAdmin
        .from('font_families')
        .insert([fontData.family])
        .select()
        .single();

      if (familyError) {
        console.error(`Error creating ${fontSlug} font family:`, familyError);
        results.push({ font: fontSlug, status: 'error', error: familyError });
        continue;
      }

      console.log(`${fontSlug} font family created successfully:`, fontFamily);

      // Create font styles
      const createdStyles = [];
      for (const styleData of fontData.styles) {
        const styleWithFamilyId = {
          ...styleData,
          font_family_id: fontFamily.id
        };

        console.log(`Creating ${fontSlug} ${styleData.name} style...`);
        const { data: fontStyle, error: styleError } = await supabaseAdmin
          .from('font_styles')
          .insert([styleWithFamilyId])
          .select()
          .single();

        if (styleError) {
          console.error(`Error creating ${fontSlug} ${styleData.name} style:`, styleError);
          results.push({ 
            font: fontSlug, 
            style: styleData.name, 
            status: 'error', 
            error: styleError 
          });
          continue;
        }

        console.log(`${fontSlug} ${styleData.name} style created successfully:`, fontStyle);
        createdStyles.push(fontStyle);
      }

      // Verify the complete font data
      const { data: verifyFamily, error: verifyError } = await supabaseAdmin
        .from('font_families')
        .select(`
          *,
          font_styles (*)
        `)
        .eq('slug', fontSlug)
        .single();

      if (verifyError) {
        console.error(`Error verifying ${fontSlug} font data:`, verifyError);
        results.push({ 
          font: fontSlug, 
          status: 'error', 
          error: verifyError 
        });
        continue;
      }

      results.push({
        font: fontSlug,
        status: 'success',
        data: {
          family: fontFamily,
          styles: createdStyles,
          verification: verifyFamily
        }
      });

      console.log(`${fontSlug} font population completed successfully!`);
    }
    
    return Response.json({ 
      success: true, 
      message: 'Font population completed',
      results
    });

  } catch (error) {
    console.error('Unexpected error in populate-fonts:', error);
    return Response.json({ 
      error: 'Unexpected error occurred', 
      details: error.message 
    }, { status: 500 });
  }
} 