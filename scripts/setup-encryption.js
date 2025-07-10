#!/usr/bin/env node

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

function generateSecureKey() {
  return crypto.randomBytes(32).toString('hex');
}

function setupEncryption() {
  console.log('🔐 Setting up font encryption...\n');

  // Generate secure encryption key
  const encryptionKey = generateSecureKey();
  
  console.log('✅ Generated secure encryption key');
  console.log('🔑 Key:', encryptionKey);
  console.log('\n📝 Add this to your .env.local file:');
  console.log(`FONT_ENCRYPTION_KEY=${encryptionKey}`);
  
  // Check if .env.local exists
  const envPath = path.join(process.cwd(), '.env.local');
  
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    if (envContent.includes('FONT_ENCRYPTION_KEY=')) {
      console.log('\n⚠️  FONT_ENCRYPTION_KEY already exists in .env.local');
      console.log('   Please update it manually with the key above');
    } else {
      // Append to existing .env.local
      const newLine = `\n# Font Security\nFONT_ENCRYPTION_KEY=${encryptionKey}\n`;
      fs.appendFileSync(envPath, newLine);
      console.log('\n✅ Added FONT_ENCRYPTION_KEY to .env.local');
    }
  } else {
    // Create new .env.local
    const envContent = `# Font Security\nFONT_ENCRYPTION_KEY=${encryptionKey}\n`;
    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ Created .env.local with FONT_ENCRYPTION_KEY');
  }

  // Create secure-fonts directory
  const secureFontsDir = path.join(process.cwd(), 'secure-fonts');
  if (!fs.existsSync(secureFontsDir)) {
    fs.mkdirSync(secureFontsDir, { recursive: true });
    console.log('✅ Created secure-fonts directory');
  }

  // Create .gitignore entry for secure-fonts
  const gitignorePath = path.join(process.cwd(), '.gitignore');
  if (fs.existsSync(gitignorePath)) {
    const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
    if (!gitignoreContent.includes('secure-fonts/')) {
      fs.appendFileSync(gitignorePath, '\n# Encrypted font files\nsecure-fonts/\n');
      console.log('✅ Added secure-fonts/ to .gitignore');
    }
  }

  console.log('\n🎉 Font encryption setup complete!');
  console.log('\n📋 Next steps:');
  console.log('1. Restart your development server to load the new environment variable');
  console.log('2. Run: node scripts/encrypt-fonts.js encrypt');
  console.log('3. Verify encryption: node scripts/encrypt-fonts.js verify');
  console.log('4. Remove public fonts: node scripts/encrypt-fonts.js encrypt --remove-public');
}

// Security recommendations
function showSecurityTips() {
  console.log('\n🔒 SECURITY RECOMMENDATIONS:');
  console.log('='.repeat(50));
  console.log('1. Keep your FONT_ENCRYPTION_KEY secret and secure');
  console.log('2. Use different keys for development and production');
  console.log('3. Store production keys in secure environment variables');
  console.log('4. Never commit encryption keys to version control');
  console.log('5. Regularly rotate encryption keys');
  console.log('6. Monitor font download logs for suspicious activity');
  console.log('7. Consider additional DRM protection for high-value fonts');
  console.log('='.repeat(50));
}

const command = process.argv[2];

switch (command) {
  case 'setup':
    setupEncryption();
    break;
  case 'tips':
    showSecurityTips();
    break;
  default:
    console.log('Font Encryption Setup Tool\n');
    console.log('Usage:');
    console.log('  node scripts/setup-encryption.js setup');
    console.log('  node scripts/setup-encryption.js tips');
    console.log('\nCommands:');
    console.log('  setup    Generate encryption key and setup environment');
    console.log('  tips     Show security recommendations');
    break;
}

if (require.main === module) {
  const command = process.argv[2] || 'setup';
  if (command === 'setup') {
    setupEncryption();
    showSecurityTips();
  }
} 