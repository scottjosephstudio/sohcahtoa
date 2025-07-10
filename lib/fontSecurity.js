import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// Font security configuration
const FONT_ENCRYPTION_KEY = process.env.FONT_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const FONT_IV_LENGTH = 16; // AES block size
const SECURE_FONTS_DIR = path.join(process.cwd(), 'secure-fonts');

class FontSecurity {
  constructor() {
    this.ensureSecureDirectory();
  }

  // Ensure secure fonts directory exists
  ensureSecureDirectory() {
    if (!fs.existsSync(SECURE_FONTS_DIR)) {
      fs.mkdirSync(SECURE_FONTS_DIR, { recursive: true });
    }
  }

  // Generate unique encryption key for each font
  generateFontKey(fontId, fontStyleId) {
    const baseKey = Buffer.from(FONT_ENCRYPTION_KEY, 'hex');
    const fontIdentifier = `${fontId}-${fontStyleId}`;
    const hash = crypto.createHash('sha256');
    hash.update(baseKey);
    hash.update(fontIdentifier);
    return hash.digest();
  }

  // Encrypt font file
  async encryptFontFile(sourcePath, fontId, fontStyleId, format) {
    try {
      // Read original font file
      const fontBuffer = fs.readFileSync(sourcePath);
      
      // Generate unique key and IV
      const key = this.generateFontKey(fontId, fontStyleId);
      const iv = crypto.randomBytes(FONT_IV_LENGTH);
      
      // Create cipher
      const cipher = crypto.createCipher('aes-256-cbc', key);
      cipher.setAutoPadding(true);
      
      // Encrypt the font data
      const encrypted = Buffer.concat([
        cipher.update(fontBuffer),
        cipher.final()
      ]);
      
      // Combine IV and encrypted data
      const encryptedWithIV = Buffer.concat([iv, encrypted]);
      
      // Generate obfuscated filename
      const obfuscatedName = this.generateObfuscatedFilename(fontId, fontStyleId, format);
      const encryptedPath = path.join(SECURE_FONTS_DIR, obfuscatedName);
      
      // Write encrypted file
      fs.writeFileSync(encryptedPath, encryptedWithIV);
      
      return {
        success: true,
        encryptedPath: obfuscatedName, // Return relative path for database
        originalSize: fontBuffer.length,
        encryptedSize: encryptedWithIV.length
      };
      
    } catch (error) {
      console.error('Font encryption error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Decrypt font file for download
  async decryptFontFile(encryptedFilename, fontId, fontStyleId) {
    try {
      const encryptedPath = path.join(SECURE_FONTS_DIR, encryptedFilename);
      
      if (!fs.existsSync(encryptedPath)) {
        throw new Error('Encrypted font file not found');
      }
      
      // Read encrypted file
      const encryptedData = fs.readFileSync(encryptedPath);
      
      // Extract IV and encrypted content
      const iv = encryptedData.slice(0, FONT_IV_LENGTH);
      const encrypted = encryptedData.slice(FONT_IV_LENGTH);
      
      // Generate decryption key
      const key = this.generateFontKey(fontId, fontStyleId);
      
      // Create decipher
      const decipher = crypto.createDecipher('aes-256-cbc', key);
      decipher.setAutoPadding(true);
      
      // Decrypt the font data
      const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final()
      ]);
      
      return {
        success: true,
        fontBuffer: decrypted
      };
      
    } catch (error) {
      console.error('Font decryption error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Generate obfuscated filename
  generateObfuscatedFilename(fontId, fontStyleId, format) {
    const hash = crypto.createHash('sha256');
    hash.update(`${fontId}-${fontStyleId}-${format}-${Date.now()}`);
    const obfuscated = hash.digest('hex').substring(0, 32);
    return `${obfuscated}.encrypted`;
  }

  // Migrate existing public fonts to secure encrypted storage
  async migratePublicFonts() {
    try {
      const publicFontsDir = path.join(process.cwd(), 'public', 'fonts');
      
      if (!fs.existsSync(publicFontsDir)) {
        return { success: true, message: 'No public fonts to migrate' };
      }
      
      const fontFiles = fs.readdirSync(publicFontsDir);
      const migrationResults = [];
      
      for (const file of fontFiles) {
        const filePath = path.join(publicFontsDir, file);
        const fileExt = path.extname(file).toLowerCase().substring(1);
        
        // Skip non-font files
        if (!['otf', 'ttf', 'woff', 'woff2'].includes(fileExt)) {
          continue;
        }
        
        // For migration, we'll use the filename as temporary IDs
        const tempFontId = path.basename(file, path.extname(file));
        const tempStyleId = 'regular';
        
        const result = await this.encryptFontFile(
          filePath,
          tempFontId,
          tempStyleId,
          fileExt
        );
        
        migrationResults.push({
          originalFile: file,
          result: result
        });
      }
      
      return {
        success: true,
        migrationResults: migrationResults
      };
      
    } catch (error) {
      console.error('Migration error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Verify font file integrity
  async verifyFontIntegrity(encryptedFilename, fontId, fontStyleId, expectedSize = null) {
    try {
      const decryptResult = await this.decryptFontFile(encryptedFilename, fontId, fontStyleId);
      
      if (!decryptResult.success) {
        return { valid: false, error: decryptResult.error };
      }
      
      const fontBuffer = decryptResult.fontBuffer;
      
      // Basic font file validation
      const isValidFont = this.validateFontBuffer(fontBuffer);
      
      if (!isValidFont) {
        return { valid: false, error: 'Invalid font file format' };
      }
      
      // Size validation if provided
      if (expectedSize && fontBuffer.length !== expectedSize) {
        return { 
          valid: false, 
          error: `Size mismatch: expected ${expectedSize}, got ${fontBuffer.length}` 
        };
      }
      
      return { 
        valid: true, 
        size: fontBuffer.length,
        format: this.detectFontFormat(fontBuffer)
      };
      
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  // Basic font format validation
  validateFontBuffer(buffer) {
    if (!buffer || buffer.length < 4) return false;
    
    // Check for common font file signatures
    const signature = buffer.slice(0, 4);
    
    // OpenType/TrueType signatures
    if (signature.equals(Buffer.from([0x00, 0x01, 0x00, 0x00]))) return true; // TTF
    if (signature.equals(Buffer.from('OTTO'))) return true; // OTF
    if (signature.equals(Buffer.from('wOFF'))) return true; // WOFF
    if (signature.equals(Buffer.from('wOF2'))) return true; // WOFF2
    
    return false;
  }

  // Detect font format from buffer
  detectFontFormat(buffer) {
    if (!buffer || buffer.length < 4) return 'unknown';
    
    const signature = buffer.slice(0, 4);
    
    if (signature.equals(Buffer.from([0x00, 0x01, 0x00, 0x00]))) return 'ttf';
    if (signature.equals(Buffer.from('OTTO'))) return 'otf';
    if (signature.equals(Buffer.from('wOFF'))) return 'woff';
    if (signature.equals(Buffer.from('wOF2'))) return 'woff2';
    
    return 'unknown';
  }

  // Clean up expired encrypted files
  async cleanupExpiredFiles(maxAge = 30 * 24 * 60 * 60 * 1000) { // 30 days
    try {
      const files = fs.readdirSync(SECURE_FONTS_DIR);
      const now = Date.now();
      let cleanedCount = 0;
      
      for (const file of files) {
        const filePath = path.join(SECURE_FONTS_DIR, file);
        const stats = fs.statSync(filePath);
        
        if (now - stats.mtime.getTime() > maxAge) {
          fs.unlinkSync(filePath);
          cleanedCount++;
        }
      }
      
      return {
        success: true,
        cleanedCount: cleanedCount
      };
      
    } catch (error) {
      console.error('Cleanup error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default FontSecurity; 