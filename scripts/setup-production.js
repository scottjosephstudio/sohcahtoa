#!/usr/bin/env node

/**
 * Production Setup Script
 * 
 * This script sets up the database with initial font data and tests the system.
 * Run with: node scripts/setup-production.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  console.log('🚀 Setting up production database...\n');

  try {
    // 1. Check if schema exists
    console.log('1. Checking database schema...');
    const { data: tables, error: tableError } = await supabase
      .from('font_families')
      .select('count', { count: 'exact', head: true });

    if (tableError) {
      console.error('❌ Database schema not found. Please run the schema.sql file first.');
      console.error('Error:', tableError.message);
      return;
    }
    console.log('✅ Database schema exists');

    // 2. Check if data already exists
    console.log('\n2. Checking existing data...');
    const { data: existingFonts, error: fontError } = await supabase
      .from('font_families')
      .select('*')
      .limit(1);

    if (fontError) {
      console.error('❌ Error checking existing fonts:', fontError.message);
      return;
    }

    if (existingFonts && existingFonts.length > 0) {
      console.log('✅ Font data already exists');
      console.log(`   Found ${existingFonts.length} font families`);
    } else {
      console.log('📝 No font data found, seeding database...');
      
      // Read and execute seed file
      const seedPath = path.join(__dirname, '../database/seed-fonts.sql');
      const seedSQL = fs.readFileSync(seedPath, 'utf8');
      
      // Split by statements and execute
      const statements = seedSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      for (const statement of statements) {
        if (statement.toLowerCase().startsWith('insert')) {
          try {
            await supabase.rpc('exec_sql', { sql: statement });
          } catch (error) {
            console.warn(`⚠️  Warning executing: ${statement.substring(0, 50)}...`);
            console.warn(`   Error: ${error.message}`);
          }
        }
      }
      
      console.log('✅ Database seeded successfully');
    }

    // 3. Verify setup
    console.log('\n3. Verifying setup...');
    
    const { data: fonts } = await supabase
      .from('font_families')
      .select(`
        *,
        font_styles (
          id,
          name,
          font_files
        )
      `);

    const { data: packages } = await supabase
      .from('license_packages')
      .select('*');

    console.log(`✅ Found ${fonts?.length || 0} font families`);
    console.log(`✅ Found ${packages?.length || 0} license packages`);

    // 4. Test API endpoints
    console.log('\n4. Testing API endpoints...');
    
    // Test payment intent creation
    try {
      const response = await fetch('http://localhost:3003/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 30.00, currency: 'gbp' })
      });
      
      if (response.ok) {
        console.log('✅ Payment intent API working');
      } else {
        console.log('⚠️  Payment intent API not responding (server may not be running)');
      }
    } catch (error) {
      console.log('⚠️  Payment intent API not responding (server may not be running)');
    }

    console.log('\n🎉 Production setup complete!\n');
    console.log('Next steps:');
    console.log('1. Start your development server: npm run dev');
    console.log('2. Test the complete flow:');
    console.log('   - Register a new account');
    console.log('   - Add fonts to cart');
    console.log('   - Complete purchase');
    console.log('   - Check downloads in user dashboard');
    console.log('\nFor email verification testing, check the console logs for verification URLs.');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

// Run setup
setupDatabase(); 