import {
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  VERIFICATION_EMAIL_TEMPLATE,
} from "./emailTemplates.js";
import getTransporter from "./nodemailer.config.js";
import nodemailer from 'nodemailer';

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
    
    // Log preview URL si en développement avec Ethereal
    try {
      const preview = nodemailer.getTestMessageUrl(response);
      if (preview) console.log(`   URL de prévisualisation: ${preview}`);
    } catch (e) {
      // Ignore - c'est normal si pas Ethereal
    }
    
    return response;
  } catch (error) {
    console.error(`❌ Erreur lors de l'envoi de l'email de vérification à ${email}:`, error.message);
    return null;
  }
};

export const sendWelcomeEmail = async (email, name) => {
  try {
    const transporter = await getTransporter();
    const fromAddress = getFromAddress();
    
    const mailOptions = {
      from: fromAddress,
      to: email,
      subject: "Bienvenue sur Entreprenapp !",
      html: `
        <h1>Bienvenue, ${name} !</h1>
        <p>Merci de rejoindre Entreprenapp, la plateforme qui accompagne les entrepreneurs dans leur croissance.</p>
        <p>Commencez dès maintenant à explorer nos outils et ressources conçus pour booster votre entreprise.</p>
        <p>Nous sommes ravis de vous compter parmi nous !</p>
        <p>Cordialement,<br><strong>L'équipe Entreprenapp</strong></p>
      `,
    };

    const response = await transporter.sendMail(mailOptions);
    console.log(`✅ Email de bienvenue envoyé à ${email}`);
    
    try {
      const preview = nodemailer.getTestMessageUrl(response);
      if (preview) console.log(`   URL de prévisualisation: ${preview}`);
    } catch (e) {
      // Ignore
    }
    
    return response;
  } catch (error) {
    console.error(`❌ Erreur lors de l'envoi de l'email de bienvenue à ${email}:`, error.message);
    return null;
  }
};

export const sendPasswordResetEmail = async (email, resetURL) => {
  try {
    const transporter = await getTransporter();
    const fromAddress = getFromAddress();
    
    const mailOptions = {
      from: fromAddress,
      to: email,
      subject: "Réinitialisation de votre mot de passe - Entreprenapp",
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
    };

    const response = await transporter.sendMail(mailOptions);
    console.log(`✅ Email de réinitialisation envoyé à ${email}`);
    
    try {
      const preview = nodemailer.getTestMessageUrl(response);
      if (preview) console.log(`   URL de prévisualisation: ${preview}`);
    } catch (e) {
      // Ignore
    }
    
    return response;
  } catch (error) {
    console.error(`❌ Erreur lors de l'envoi de l'email de réinitialisation à ${email}:`, error.message);
    return null;
  }
};

export const sendResetSuccessEmail = async (email) => {
  try {
    const transporter = await getTransporter();
    const fromAddress = getFromAddress();
    
    const mailOptions = {
      from: fromAddress,
      to: email,
      subject: "Réinitialisation réussie - Entreprenapp",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE,
    };

    const response = await transporter.sendMail(mailOptions);
    console.log(`✅ Email de confirmation envoyé à ${email}`);
    
    try {
      const preview = nodemailer.getTestMessageUrl(response);
      if (preview) console.log(`   URL de prévisualisation: ${preview}`);
    } catch (e) {
      // Ignore
    }
    
    return response;
  } catch (error) {
    console.error(`❌ Erreur lors de l'envoi de l'email de confirmation à ${email}:`, error.message);
    return null;
  }
};