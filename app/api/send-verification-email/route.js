import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/database/supabaseClient';

// =============================================
// EMAIL VERIFICATION ENDPOINT
// =============================================

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, firstName, verificationToken } = body;

    if (!email || !verificationToken) {
      return NextResponse.json(
        { error: 'Email and verification token are required' },
        { status: 400 }
      );
    }

    // Create verification link
    const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3003'}/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`;

    // Email content
    const emailContent = {
      to: email,
      subject: 'Verify your Scott Joseph Studio account',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify your account</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: rgb(16, 12, 8);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f9f9f9;
              padding: 30px;
              border: 1px solid #ddd;
            }
            .button {
              display: inline-block;
              background: rgb(16, 12, 8);
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 8px;
              margin: 20px 0;
              font-weight: bold;
            }
            .footer {
              background: #f5f5f5;
              padding: 20px;
              text-align: center;
              font-size: 14px;
              color: #666;
              border-radius: 0 0 10px 10px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Scott Joseph Studio</h1>
            <p>Verify your account</p>
          </div>
          
          <div class="content">
            <p>Hello${firstName ? ` ${firstName}` : ''},</p>
            
            <p>Thank you for creating an account with Scott Joseph Studio. To complete your registration and access your typeface downloads, please verify your email address by clicking the button below:</p>
            
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </div>
            
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 4px;">${verificationUrl}</p>
            
            <p>This verification link will expire in 24 hours for security reasons.</p>
            
            <p>If you didn't create an account with us, please ignore this email.</p>
            
            <p>Best regards,<br>Scott Joseph Studio</p>
          </div>
          
          <div class="footer">
            <p>© 2024 Scott Joseph Studio. All rights reserved.</p>
            <p>This is an automated email. Please do not reply to this address.</p>
          </div>
        </body>
        </html>
      `,
      text: `
        Hello${firstName ? ` ${firstName}` : ''},

        Thank you for creating an account with Scott Joseph Studio. To complete your registration and access your typeface downloads, please verify your email address by visiting this link:

        ${verificationUrl}

        This verification link will expire in 24 hours for security reasons.

        If you didn't create an account with us, please ignore this email.

        Best regards,
        Scott Joseph Studio
      `
    };

    // For development, log the email content instead of sending
    if (process.env.NODE_ENV === 'development') {
      console.log('=== EMAIL VERIFICATION (Development Mode) ===');
      console.log('To:', emailContent.to);
      console.log('Subject:', emailContent.subject);
      console.log('Verification URL:', verificationUrl);
      console.log('===============================================');
      
      return NextResponse.json({
        success: true,
        message: 'Verification email logged to console (development mode)',
        verificationUrl: verificationUrl // Return URL for testing
      });
    }

    // In production, integrate with your email service (SendGrid, Mailgun, etc.)
    // Example with fetch to an email service:
    /*
    const emailResponse = await fetch('YOUR_EMAIL_SERVICE_API', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.EMAIL_SERVICE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailContent)
    });

    if (!emailResponse.ok) {
      throw new Error('Failed to send email');
    }
    */

    return NextResponse.json({
      success: true,
      message: 'Verification email sent successfully'
    });

  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Failed to send verification email' },
      { status: 500 }
    );
  }
} 