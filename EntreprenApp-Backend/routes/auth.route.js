import express from "express";
import { register, forgotPassword, GetMyProfile, Login, LogOut, refreshUserToken, resendVerificationCode, resetPassword, updateUser, verifyEmail, getUserProfileById } from "../controllers/auth.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import upload from "../utils/cloudinary.js";

const authRoute = express.Router();

/**
 * @swagger
 * /api/auth/create-account:
 *   post:
 *     summary: Inscrire un nouvel utilisateur avec rôle et documents facultatifs
 *     tags: [Authentification]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               fullname:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: ['entrepreneur', 'investor', 'startup', 'organisation', 'university']
 *               location:
 *                 type: string
 *               gender:
 *                 type: string
 *               dob:
 *                 type: string
 *                 format: date
 *
 *               sector:
 *                 type: string
 *               professionalEmail:
 *                 type: string
 *               foundedYear:
 *                 type: integer
 *               universityName:
 *                 type: string
 *               officialUniversityEmail:
 *                 type: string
 *               verificationDocument:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès. Vérifiez votre e-mail pour activer le compte.
 *       400:
 *         description: Données manquantes ou invalides
 *       500:
 *         description: Erreur interne du serveur
 */
authRoute.post('/register', upload.single('verificationDocument'), register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Connecter l'utilisateur
 *     tags: [Authentification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Connexion réussie. Jetons stockés dans les cookies.
 *       401:
 *         description: Non autorisé - Identifiants invalides
 *       400:
 *         description: Email ou mot de passe requis
 *       500:
 *         description: Erreur interne du serveur
 */
authRoute.post('/login', Login);

/**
 * @swagger
 * /api/auth/verify:
 *   post:
 *     summary: Vérifier l'e-mail à l'aide d'un code
 *     tags: [Authentification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               verificationCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: E-mail vérifié avec succès
 *       400:
 *         description: Code de vérification invalide ou expiré
 *       500:
 *         description: Erreur interne du serveur
 */
authRoute.post('/verify', verifyEmail);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Déconnecter l'utilisateur en effaçant les cookies
 *     tags: [Authentification]
 *     responses:
 *       200:
 *         description: Déconnexion réussie
 *       500:
 *         description: Erreur interne du serveur
 */
authRoute.post('/logout', LogOut);

/**
 * @swagger
 * /api/auth/resend-code:
 *   post:
 *     summary: Renvoyer le code de vérification à l'e-mail de l'utilisateur
 *     tags: [Authentification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Nouveau code de vérification envoyé si l'utilisateur existe
 *       400:
 *         description: E-mail requis
 *       500:
 *         description: Erreur interne du serveur
 */
authRoute.post('/resend-code', resendVerificationCode);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Envoyer un lien de réinitialisation du mot de passe
 *     tags: [Mot de passe]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Lien de réinitialisation envoyé si l'e-mail existe
 *       400:
 *         description: E-mail requis
 *       500:
 *         description: Erreur interne du serveur
 */
authRoute.post('/forgot-password', forgotPassword);

/**
 * @swagger
 * /api/auth/reset-password/{resetToken}:
 *   post:
 *     summary: Réinitialiser le mot de passe à l'aide d'un token valide
 *     tags: [Mot de passe]
 *     parameters:
 *       - in: path
 *         name: resetToken
 *         required: true
 *         schema:
 *           type: string
 *         description: Jeton de réinitialisation reçu par e-mail
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Mot de passe mis à jour avec succès
 *       400:
 *         description: Token invalide ou mot de passe non fourni
 *       500:
 *         description: Erreur interne du serveur
 */
authRoute.post('/reset-password/:resetToken', resetPassword);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Obtenir le profil de l'utilisateur connecté
 *     tags: [Profil]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Profil utilisateur récupéré avec succès
 *       401:
 *         description: Utilisateur non authentifié
 *       404:
 *         description: Utilisateur non trouvé ou compte non activé
 *       500:
 *         description: Erreur interne du serveur
 */
authRoute.get('/profile', authenticateToken, GetMyProfile);



/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     tags:
 *      - Authentification
 *     summary: Rafraîchir les tokens utilisateur
 *     description: Rafraîchit les tokens d'accès et de rafraîchissement de l'utilisateur en utilisant le refresh token stocké dans les cookies.
 *     responses:
 *       200:
 *         description: Tokens rafraîchis avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Token rafraîchi
 *                 user:
 *                   type: object
 *                   description: Les informations de l'utilisateur décodées à partir du JWT
 *       401:
 *         description: Aucun refresh token fourni
 *       403:
 *         description: Refresh token invalide ou expiré
 */
authRoute.post('/refresh', refreshUserToken);

/**
 * @swagger
 * /api/auth/profile/edit:
 *   put:
 *     summary: Mettre à jour le profil utilisateur y compris les images
 *     tags: [Profil]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               fullname:
 *                 type: string
 *               bio:
 *                 type: string
 *               gender:
 *                 type: string
 *               dob:
 *                 type: string
 *                 format: date
 *               location:
 *                 type: string
 *               profileImage:
 *                 type: string
 *                 format: binary
 *               coverImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profil mis à jour avec succès
 *       400:
 *         description: Échec lors du téléchargement de l'image
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur interne du serveur
 */
authRoute.put(
  '/profile/edit',
  authenticateToken,
  upload.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 }
  ]),
  updateUser
);

/**
 * @swagger
 * /api/auth/profile/{userId}:
 *   get:
 *     summary: Récupérer le profil d'un utilisateur par son ID
 *     tags: [Authentification]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Profil utilisateur récupéré avec succès
 *       400:
 *         description: ID utilisateur manquant
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur interne du serveur
 */
authRoute.get('/profile/:userId', getUserProfileById);

export default authRoute;