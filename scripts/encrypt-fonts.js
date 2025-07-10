#!/usr/bin/env node

const FontSecurity = require('../lib/fontSecurity');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Initialize clients
const supabaseService = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const fontSecurity = new FontSecurity();

async function encryptFonts() {
  console.log('🔐 Starting font encryption migration...\n');

  try {
    // Get all font styles from database
    const { data: fontStyles, error: fontError } = await supabaseService
      .from('font_styles')
      .select(`
        id,
        name,
        font_files,
        font_families (
          id,
          name,
          slug
        )
      `);

    if (fontError) {
      console.error('❌ Failed to fetch font styles:', fontError);
      return;
    }

    console.log(`📊 Found ${fontStyles.length} font styles to process\n`);

    let totalProcessed = 0;
    let totalEncrypted = 0;
    let totalSkipped = 0;
    let totalErrors = 0;

    for (const fontStyle of fontStyles) {
      const fontFiles = fontStyle.font_files || {};
      const updatedFontFiles = { ...fontFiles };
      let hasUpdates = false;

      console.log(`\n📝 Processing: ${fontStyle.font_families.name} - ${fontStyle.name}`);
      console.log(`   Font Style ID: ${fontStyle.id}`);

      for (const [format, filePath] of Object.entries(fontFiles)) {
        totalProcessed++;
        
        // Skip already encrypted files
        if (filePath.startsWith('secure:')) {
          console.log(`   ⏭️  ${format.toUpperCase()}: Already encrypted`);
          totalSkipped++;
          continue;
        }

        // Convert public path to full path
        const fullPath = path.join(process.cwd(), 'public', filePath);
        
        // Check if file exists
        if (!fs.existsSync(fullPath)) {
          console.log(`   ❌ ${format.toUpperCase()}: File not found at ${fullPath}`);
          totalErrors++;
          continue;
        }

        console.log(`   🔄 ${format.toUpperCase()}: Encrypting...`);

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
          totalEncrypted++;
          
          console.log(`   ✅ ${format.toUpperCase()}: Encrypted successfully`);
          console.log(`      Original size: ${(encryptResult.originalSize / 1024).toFixed(2)} KB`);
          console.log(`      Encrypted size: ${(encryptResult.encryptedSize / 1024).toFixed(2)} KB`);
        } else {
          console.log(`   ❌ ${format.toUpperCase()}: Encryption failed - ${encryptResult.error}`);
          totalErrors++;
        }
      }

      // Update database if we have changes
      if (hasUpdates) {
        const { error: updateError } = await supabaseService
          .from('font_styles')
          .update({ font_files: updatedFontFiles })
          .eq('id', fontStyle.id);

        if (updateError) {
          console.log(`   ❌ Database update failed: ${updateError.message}`);
          totalErrors++;
        } else {
          console.log(`   💾 Database updated successfully`);
        }
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 ENCRYPTION SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total files processed: ${totalProcessed}`);
    console.log(`Successfully encrypted: ${totalEncrypted}`);
    console.log(`Already encrypted (skipped): ${totalSkipped}`);
    console.log(`Errors: ${totalErrors}`);
    console.log('='.repeat(60));

    if (totalEncrypted > 0) {
      console.log('\n🎉 Font encryption completed successfully!');
      console.log('📝 Your fonts are now securely encrypted and protected.');
      console.log('🔒 Only authenticated users with valid licenses can download them.');
      
      // Optionally remove public fonts after successful encryption
      const removePublic = process.argv.includes('--remove-public');
      if (removePublic) {
        console.log('\n🗑️  Removing public font files...');
        await removePublicFonts();
      } else {
        console.log('\n💡 Tip: Run with --remove-public flag to remove public font files after encryption');
      }
    }

  } catch (error) {
    console.error('❌ Migration error:', error);
  }
}

async function removePublicFonts() {
  try {
    const publicFontsDir = path.join(process.cwd(), 'public', 'fonts');
    
    if (!fs.existsSync(publicFontsDir)) {
      console.log('   ℹ️  No public fonts directory found');
      return;
    }

    const fontFiles = fs.readdirSync(publicFontsDir);
    let removedCount = 0;

    for (const file of fontFiles) {
      const filePath = path.join(publicFontsDir, file);
      const fileExt = path.extname(file).toLowerCase().substring(1);
      
      // Only remove font files
      if (['otf', 'ttf', 'woff', 'woff2'].includes(fileExt)) {
        fs.unlinkSync(filePath);
        removedCount++;
        console.log(`   🗑️  Removed: ${file}`);
      }
    }

    console.log(`\n   ✅ Removed ${removedCount} public font files`);
    
    // Remove directory if empty
    const remainingFiles = fs.readdirSync(publicFontsDir);
    if (remainingFiles.length === 0) {
      fs.rmdirSync(publicFontsDir);
      console.log('   🗑️  Removed empty fonts directory');
    }

  } catch (error) {
    console.error('❌ Error removing public fonts:', error);
  }
}

async function verifyEncryption() {
  console.log('🔍 Verifying encrypted fonts...\n');

  try {
    const { data: fontStyles, error } = await supabaseService
      .from('font_styles')
      .select(`
        id,
        name,
        font_files,
        font_families (
          id,
          name,
          slug
        )
      `);

    if (error) {
      console.error('❌ Failed to fetch font styles:', error);
      return;
    }

    let totalVerified = 0;
    let totalFailed = 0;

    for (const fontStyle of fontStyles) {
      const fontFiles = fontStyle.font_files || {};
      
      console.log(`\n📝 Verifying: ${fontStyle.font_families.name} - ${fontStyle.name}`);

      for (const [format, filePath] of Object.entries(fontFiles)) {
        if (!filePath.startsWith('secure:')) {
          continue;
        }

        const encryptedFilename = filePath.replace('secure:', '');
        
        const verification = await fontSecurity.verifyFontIntegrity(
          encryptedFilename,
          fontStyle.font_families.id,
          fontStyle.id
        );

        if (verification.valid) {
          console.log(`   ✅ ${format.toUpperCase()}: Valid (${verification.format}, ${verification.size} bytes)`);
          totalVerified++;
        } else {
          console.log(`   ❌ ${format.toUpperCase()}: Invalid - ${verification.error}`);
          totalFailed++;
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('🔍 VERIFICATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`Successfully verified: ${totalVerified}`);
    console.log(`Failed verification: ${totalFailed}`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Verification error:', error);
  }
}

// Command line interface
const command = process.argv[2];

switch (command) {
  case 'encrypt':
    encryptFonts();
    break;
  case 'verify':
    verifyEncryption();
    break;
  default:
    console.log('Font Encryption Tool\n');
    console.log('Usage:');
    console.log('  node scripts/encrypt-fonts.js encrypt [--remove-public]');
    console.log('  node scripts/encrypt-fonts.js verify');
    console.log('\nCommands:');
    console.log('  encrypt          Encrypt all public font files');
    console.log('  verify           Verify encrypted font files');
    console.log('\nOptions:');
    console.log('  --remove-public  Remove public font files after encryption');
    break;
} 