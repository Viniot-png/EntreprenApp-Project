export const VERIFICATION_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Vérifiez Votre Email - EntreprenApp</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #4CAF50, #45a049); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Vérifiez Votre Email</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Bonjour,</p>
    <p>Bienvenue sur <strong>EntreprenApp</strong> ! Veuillez vérifier votre adresse e-mail à l'aide du code ci-dessous :</p>
    <div style="text-align: center; margin: 30px 0;">
      <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4CAF50;">{verificationCode}</span>
    </div>
    <p>Ce code expirera dans 10 minutes pour des raisons de sécurité.</p>
    <p>Si vous n'avez pas créé de compte, veuillez ignorer cet e-mail.</p>
    <p>Cordialement,<br><strong>L'équipe d'EntreprenApp</strong></p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>Ceci est un message automatisé, veuillez ne pas répondre à cet e-mail.</p>
  </div>
</body>
</html>
`;

export const PASSWORD_RESET_SUCCESS_TEMPLATE = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Mot de Passe Réinitialisé avec Succès - EntreprenApp</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #4CAF50, #45a049); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Mot de Passe Réinitialisé</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Bonjour,</p>
    <p>Votre mot de passe a été réinitialisé avec succès. Vous pouvez désormais vous connecter à votre compte EntreprenApp avec vos nouvelles informations.</p>
    <div style="text-align: center; margin: 30px 0;">
      <div style="background-color: #4CAF50; color: white; width: 50px; height: 50px; line-height: 50px; border-radius: 50%; display: inline-block; font-size: 30px;">
        ✓
      </div>
    </div>
    <p>Si vous n'êtes à l'origine de cette modification, veuillez contacter notre équipe d'assistance immédiatement.</p>
    <p>Nous vous recommandons les mesures suivantes pour protéger votre compte :</p>
    <ul>
      <li>Utilisez un mot de passe fort et unique</li>
      <li>Évitez de partager publiquement votre mot de passe</li>
      <li>Déconnectez-vous après chaque session</li>
    </ul>
    <p>Merci de faire partie de la communauté EntreprenApp !</p>
    <p>Cordialement,<br><strong>L'équipe d'EntreprenApp</strong></p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>Ceci est un message automatisé, veuillez ne pas répondre à cet e-mail.</p>
  </div>
</body>
</html>
`;

export const PASSWORD_RESET_REQUEST_TEMPLATE = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Réinitialisez Votre Mot de Passe - EntreprenApp</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #4CAF50, #45a049); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Réinitialisation du Mot de Passe</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Bonjour,</p>
    <p>Nous avons reçu une demande pour réinitialiser le mot de passe de votre compte EntreprenApp. Si ce n'est pas de votre fait, veuillez ignorer cet e-mail.</p>
    <p>Pour réinitialiser votre mot de passe, cliquez sur le bouton ci-dessous :</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="{resetURL}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Réinitialiser le Mot de Passe</a>
    </div>
    <p>Ce lien expirera dans 10 minutes pour des raisons de sécurité.</p>
    <p>Cordialement,<br><strong>L'équipe d'EntreprenApp</strong></p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>Ceci est un message automatisé, veuillez ne pas répondre à cet e-mail.</p>
  </div>
</body>
</html>
`;