import express from "express";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { getConnectionSuggestions, sendFriendRequest, getUserProfile } from "../controllers/suggestions.controller.js";

const suggestionsRoute = express.Router();

/**
 * @swagger
 * /api/suggestions:
 *   get:
 *     summary: Obtenir les suggestions de connexion
 *     tags: [Suggestions]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Liste des suggestions de connexion
 *       500:
 *         description: Erreur interne du serveur
 */
suggestionsRoute.get('/', authenticateToken, getConnectionSuggestions);

/**
 * @swagger
 * /api/suggestions/request:
 *   post:
 *     summary: Envoyer une demande de connexion
 *     tags: [Suggestions]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               targetUserId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Demande de connexion envoyée avec succès
 *       400:
 *         description: Requête invalide
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur interne du serveur
 */
suggestionsRoute.post('/request', authenticateToken, sendFriendRequest);

/**
 * @swagger
 * /api/suggestions/profile/{userId}:
 *   get:
 *     summary: Obtenir le profil complet d'un utilisateur avec ses événements et projets
 *     tags: [Suggestions]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Profil utilisateur avec événements et projets
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur interne du serveur
 */
suggestionsRoute.get('/profile/:userId', authenticateToken, getUserProfile);

export default suggestionsRoute;
