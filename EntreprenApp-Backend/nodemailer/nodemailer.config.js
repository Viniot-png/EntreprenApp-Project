import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

let cachedTransporter = null;

/**
 * Configuration SendGrid pour production
 * ou Ethereal pour développement local
 */
export const getTransporter = async () => {
  if (cachedTransporter) return cachedTransporter;

  // Configuration SendGrid (Production)
  if (process.env.SENDGRID_API_KEY) {
    const transportOptions = {
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      auth: {
        user: 'apikey', // SendGrid utilise toujours 'apikey' comme username
        pass: process.env.SENDGRID_API_KEY,
      },
      connectionTimeout: 10000,
      socketTimeout: 30000,
    };

    cachedTransporter = nodemailer.createTransport(transportOptions);
    
    try {
      await cachedTransporter.verify();
      console.log('✅ Nodemailer: SendGrid SMTP transporter verified');
    } catch (verifyErr) {
      console.error('❌ Nodemailer: SendGrid transporter verification failed', verifyErr);
    }
    
    return cachedTransporter;
  }

  // Configuration SMTP générique (fallback)
  if (process.env.SMTP_HOST) {
    const transportOptions = {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
      connectionTimeout: 10000,
      socketTimeout: 30000,
    };

    cachedTransporter = nodemailer.createTransport(transportOptions);
    
    try {
      await cachedTransporter.verify();
      console.log('✅ Nodemailer: SMTP transporter verified');
    } catch (verifyErr) {
      console.error('❌ Nodemailer: transporter verification failed', verifyErr);
    }
    
    return cachedTransporter;
  }

  // Fallback: Ethereal test account (développement local)
  try {
    const testAccount = await nodemailer.createTestAccount();
    cachedTransporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });

    console.log('⚠️  Nodemailer: no SendGrid/SMTP config found, using Ethereal test account.');
    console.log('   Emails will not be delivered to real inboxes (development only).');
    return cachedTransporter;
  } catch (err) {
    console.error('❌ Nodemailer: Failed to create Ethereal account', err);
    throw new Error('Email transporter configuration failed');
  }
};

export default getTransporter;