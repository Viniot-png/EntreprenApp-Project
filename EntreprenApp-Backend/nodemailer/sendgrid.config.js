import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

dotenv.config();

let sgMailConfigured = false;

/**
 * Initialize SendGrid API
 */
export const initializeSendGrid = () => {
  if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    sgMailConfigured = true;
    console.log('✅ SendGrid API initialized');
    return true;
  }
  console.warn('⚠️  SENDGRID_API_KEY not found - email sending will fail');
  return false;
};

/**
 * Send email using SendGrid API
 */
export const sendEmailViaSendGrid = async (to, subject, html) => {
  try {
    if (!sgMailConfigured) {
      initializeSendGrid();
    }

    const msg = {
      to,
      from: process.env.SENDGRID_FROM_EMAIL || 'brugeonmadiba@gmail.com',
      subject,
      html,
      replyTo: process.env.SENDGRID_FROM_EMAIL || 'brugeonmadiba@gmail.com',
    };

    const response = await sgMail.send(msg);
    console.log(`✅ Email sent to ${to}:`, response[0].statusCode);
    return { success: true, response };
  } catch (error) {
    console.error(`❌ SendGrid API error for ${to}:`, error.message);
    throw error;
  }
};

export default sgMail;
