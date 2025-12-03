import express from "express";
import { getFriends, getPendingFriendRequests, respondToFriendRequest, sendFriendRequest, getAllUsers, removeFriend } from "../controllers/friend.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const friendRoute = express.Router();

/**
 * @swagger
 * /api/friend/invitation:
 *   post:
 *     summary: Envoyer une demande d'ami
 *     tags: [Amis]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               receiverId:
 *                 type: string
 *                 description: ID de l'utilisateur qui recevra la demande
 *     responses:
 *       201:
 *         description: Demande envoyée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/FriendRequest'
 *       400:
 *         description: Demande déjà envoyée ou données invalides
 *       500:
 *         description: Erreur interne du serveur
 */
friendRoute.post('/invitation', authenticateToken, sendFriendRequest);

/**
 * @swagger
 * /api/friend/invitation/{requestId}:
 *   post:
 *     summary: Répondre à une demande d'ami
 *     tags: [Amis]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la demande d'ami
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               action:
 *                 type: string
 *                 enum: ['accepted', 'rejected']
 *                 description: Action à effectuer sur la demande
 *     responses:
 *       200:
 *         description: Réponse à la demande traitée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/FriendRequest'
 *       400:
 *         description: Action invalide ou demande déjà traitée
 *       403:
 *         description: Non autorisé
 *       404:
 *         description: Demande non trouvée
 *       500:
 *         description: Erreur interne du serveur
 */
friendRoute.post('/invitation/:requestId', authenticateToken, respondToFriendRequest);

/**
 * @swagger
 * /api/friend:
 *   get:
 *     summary: Récupérer la liste des amis
 *     tags: [Amis]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Liste des amis récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 friends:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       fullname:
 *                         type: string
 *                       email:
 *                         type: string
 *                       profileImage:
 *                         type: string
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur interne du serveur
 */
friendRoute.get('/', authenticateToken, getFriends);

/**
 * @swagger
 * /api/friend/pending:
 *   get:
 *     summary: Récupérer les demandes d'amis en attente
 *     tags: [Amis]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Demandes en attente récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 pendingRequests:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/FriendRequest'
 *       500:
 *         description: Erreur interne du serveur
 */
friendRoute.get('/pending', authenticateToken, getPendingFriendRequests);

/**
 * @swagger
 * /api/friend/all:
 *   get:
 *     summary: Récupérer tous les utilisateurs avec leur statut d'amitié
 *     tags: [Amis]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Liste de tous les utilisateurs
 *       500:
 *         description: Erreur interne du serveur
 */
friendRoute.get('/all', authenticateToken, getAllUsers);

/**
 * @swagger
 * /api/friend/{friendId}:
 *   delete:
 *     summary: Supprimer une connexion ami
 *     tags: [Amis]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: friendId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'ami à supprimer
 *     responses:
 *       200:
 *         description: Ami supprimé avec succès
 *       400:
 *         description: ID ami manquant
 *       500:
 *         description: Erreur interne du serveur
 */
friendRoute.delete('/:friendId', authenticateToken, removeFriend);

export default friendRoute;