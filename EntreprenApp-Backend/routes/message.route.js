import express from "express";
import { GetMessages, SendMessage, DeleteMessage, UpdateMessage, GetConversations } from "../controllers/message.controller.js";
import { uploadMedia } from "../utils/uploadMiddleware.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const messageRoute = express.Router();

/**
 * @swagger
 * /api/message/{id}:
 *   get:
 *     summary: Récupérer tous les messages échangés avec un utilisateur spécifique
 *     tags: [Message]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de l'utilisateur avec lequel la conversation est échangée
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des messages récupérés avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Message'
 *       400:
 *         description: ID utilisateur invalide
 *       500:
 *         description: Erreur serveur lors de la récupération des messages
 */
/**
 * @swagger
 * /api/message/conversations:
 *   get:
 *     summary: Récupérer la liste des conversations de l'utilisateur
 *     tags: [Message]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Liste des conversations récupérée
 *       500:
 *         description: Erreur serveur lors de la récupération
 */
messageRoute.get('/conversations', authenticateToken, GetConversations);

messageRoute.get('/:id', authenticateToken, GetMessages);

/**
 * @swagger
 * /api/message/send/{id}:
 *   post:
 *     summary: Envoyer un message à un utilisateur
 *     tags: [Message]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID du destinataire
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Données du message à envoyer
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *                 description: Texte du message
 *               image:
 *                 type: string
 *                 format: base64
 *                 description: Image au format base64 (optionnel)
 *     responses:
 *       201:
 *         description: Message envoyé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Message'
 *       500:
 *         description: Erreur serveur lors de l'envoi du message
 */
messageRoute.post('/send/:id', authenticateToken, uploadMedia, SendMessage);

/**
 * @swagger
 * /api/message/update/{id}:
 *   put:
 *     summary: Mettre à jour un message envoyé
 *     tags: [Message]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID du message à mettre à jour
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Données modifiées du message
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *                 description: Nouveau texte du message (optionnel)
 *               image:
 *                 type: string
 *                 format: base64
 *                 description: Nouvelle image au format base64 ou null pour supprimer l'image (optionnel)
 *     responses:
 *       200:
 *         description: Message mis à jour avec succès
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
 *                   $ref: '#/components/schemas/Message'
 *       403:
 *         description: Mise à jour non autorisée (message non envoyé par l'utilisateur)
 *       404:
 *         description: Message non trouvé
 *       500:
 *         description: Erreur serveur lors de la mise à jour du message
 */
messageRoute.put('/update/:id', authenticateToken, uploadMedia, UpdateMessage);

/**
 * @swagger
 * /api/message/delete/{id}:
 *   delete:
 *     summary: Supprimer un message envoyé
 *     tags: [Message]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID du message à supprimer
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Message supprimé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 deletedMessageId:
 *                   type: string
 *                   description: ID du message supprimé
 *       403:
 *         description: Suppression non autorisée (message non envoyé par l'utilisateur)
 *       404:
 *         description: Message non trouvé
 *       500:
 *         description: Erreur serveur lors de la suppression du message
 */
messageRoute.delete('/delete/:id', authenticateToken, DeleteMessage);

export default messageRoute;
