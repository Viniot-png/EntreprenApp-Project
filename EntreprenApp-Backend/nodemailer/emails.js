import {
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  VERIFICATION_EMAIL_TEMPLATE,
} from "./emailTemplates.js";
import { sendEmailViaSendGrid, initializeSendGrid } from "./sendgrid.config.js";
import getTransporter from "./nodemailer.config.js";

/**
 * Récupère l'adresse email "from" configurée
 * Priorité: SENDGRID_FROM_EMAIL > SMTP_USER > par défaut
 */
const getFromAddress = () => {
  return process.env.SENDGRID_FROM_EMAIL || process.env.SMTP_USER || 'no-reply@entreprenapp.local';
};

export const sendVerificationEmail = async (email, verificationToken) => {
  try {
    if (!email) throw new Error("Aucune adresse email fournie");

    // Try SendGrid API first (works on Render)
    if (process.env.SENDGRID_API_KEY) {
      const htmlContent = VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken);
      await sendEmailViaSendGrid(email, "Vérification de votre email - Entreprenapp", htmlContent);
      return { success: true };
    }
    
    // Fallback to SMTP
    const transporter = await getTransporter();
    const fromAddress = getFromAddress();
    
    const mailOptions = {
      from: fromAddress,
      to: email,
      subject: "Vérification de votre email - Entreprenapp",
      html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
    };

    const response = await transporter.sendMail(mailOptions);
    console.log(`✅ Email de vérification envoyé à ${email} (messageId=${response.messageId})`);
    return response;
  } catch (error) {
    console.error(`❌ Erreur lors de l'envoi de l'email de vérification à ${email}:`, error.message);
    return null;
  }
};

export const sendWelcomeEmail = async (email, name) => {
  try {
    const htmlContent = `
      <h1>Bienvenue, ${name} !</h1>
      <p>Merci de rejoindre Entreprenapp, la plateforme qui accompagne les entrepreneurs dans leur croissance.</p>
      <p>Commencez dès maintenant à explorer nos outils et ressources conçus pour booster votre entreprise.</p>
      <p>Nous sommes ravis de vous compter parmi nous !</p>
      <p>Cordialement,<br><strong>L'équipe Entreprenapp</strong></p>
    `;

    // Try SendGrid API first
    if (process.env.SENDGRID_API_KEY) {
      await sendEmailViaSendGrid(email, "Bienvenue sur Entreprenapp !", htmlContent);
      return { success: true };
    }
    
    // Fallback to SMTP
    const transporter = await getTransporter();
    const fromAddress = getFromAddress();
    const response = await transporter.sendMail({
      from: fromAddress,
      to: email,
      subject: "Bienvenue sur Entreprenapp !",
      html: htmlContent,
    });
    console.log(`✅ Email de bienvenue envoyé à ${email}`);
    return response;
  } catch (error) {
    console.error(`❌ Erreur lors de l'envoi de l'email de bienvenue à ${email}:`, error.message);
    return null;
  }
};

export const sendPasswordResetEmail = async (email, resetURL) => {
  try {
    const htmlContent = PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL);

    // Try SendGrid API first
    if (process.env.SENDGRID_API_KEY) {
      await sendEmailViaSendGrid(email, "Réinitialisation de votre mot de passe - Entreprenapp", htmlContent);
      return { success: true };
    }
    
    // Fallback to SMTP
    const transporter = await getTransporter();
    const fromAddress = getFromAddress();
    const response = await transporter.sendMail({
      from: fromAddress,
      to: email,
      subject: "Réinitialisation de votre mot de passe - Entreprenapp",
      html: htmlContent,
    });
    console.log(`✅ Email de réinitialisation envoyé à ${email}`);
    return response;
  } catch (error) {
    console.error(`❌ Erreur lors de l'envoi de l'email de réinitialisation à ${email}:`, error.message);
    return null;
  }
};

export const sendResetSuccessEmail = async (email) => {
  try {
    // Try SendGrid API first
    if (process.env.SENDGRID_API_KEY) {
      await sendEmailViaSendGrid(email, "Réinitialisation réussie - Entreprenapp", PASSWORD_RESET_SUCCESS_TEMPLATE);
      return { success: true };
    }
    
    // Fallback to SMTP
    const transporter = await getTransporter();
    const fromAddress = getFromAddress();
    const response = await transporter.sendMail({
      from: fromAddress,
      to: email,
      subject: "Réinitialisation réussie - Entreprenapp",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE,
    });
    console.log(`✅ Email de confirmation envoyé à ${email}`);
    return response;
  } catch (error) {
    console.error(`❌ Erreur lors de l'envoi de l'email de confirmation à ${email}:`, error.message);
    return null;
  }
};