import express from "express";
import { addComment, deleteComment, getComment, updateComment, getCommentsByPost, addReplyToComment, getCommentReplies, likeComment } from "../controllers/comment.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const commentRoute = express.Router();

/**
 * @swagger
 * /api/comment/post/{id}:
 *   post:
 *     summary: Ajouter un commentaire à un post
 *     tags: [Commentaire]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du post sur lequel commenter
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: Contenu du commentaire à ajouter
 *     responses:
 *       201:
 *         description: Commentaire ajouté avec succès
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
 *                   $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Contenu du commentaire requis
 *       404:
 *         description: Post non trouvé
 *       500:
 *         description: Erreur interne du serveur
 */
commentRoute.get('/post/:id', authenticateToken, getCommentsByPost);
commentRoute.post('/post/:id', authenticateToken, addComment);

/**
 * @swagger
 * /api/comment/edit/{id}:
 *   put:
 *     summary: Mettre à jour un commentaire existant
 *     tags: [Commentaire]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du commentaire à modifier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: Nouveau contenu du commentaire
 *     responses:
 *       200:
 *         description: Commentaire mis à jour avec succès
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
 *                   $ref: '#/components/schemas/Comment'
 *       403:
 *         description: Non autorisé - Vous n'avez pas les droits
 *       404:
 *         description: Commentaire non trouvé
 *       500:
 *         description: Erreur interne du serveur
 */
commentRoute.put('/edit/:id', authenticateToken, updateComment);

/**
 * @swagger
 * /api/comment/{id}:
 *   get:
 *     summary: Récupérer un commentaire par son ID
 *     tags: [Commentaire]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du commentaire à récupérer
 *     responses:
 *       200:
 *         description: Commentaire récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Comment'
 *       404:
 *         description: Commentaire non trouvé
 *       500:
 *         description: Erreur interne du serveur
 */
commentRoute.get('/:id', authenticateToken, getComment);

/**
 * @swagger
 * /api/comment/delete/{id}:
 *   delete:
 *     summary: Supprimer un commentaire
 *     tags: [Commentaire]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du commentaire à supprimer
 *     responses:
 *       200:
 *         description: Commentaire supprimé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       403:
 *         description: Non autorisé - Vous n'avez pas les droits
 *       404:
 *         description: Commentaire non trouvé
 *       500:
 *         description: Erreur interne du serveur
 */
commentRoute.delete('/delete/:id', authenticateToken, deleteComment);

/**
 * @swagger
 * /api/comment/{commentId}/reply:
 *   post:
 *     summary: Ajouter une réponse à un commentaire
 *     tags: [Commentaire]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du commentaire parent
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: Contenu de la réponse
 *     responses:
 *       201:
 *         description: Réponse ajoutée avec succès
 *       400:
 *         description: Contenu requis
 *       404:
 *         description: Commentaire parent non trouvé
 *       500:
 *         description: Erreur interne du serveur
 */
commentRoute.post('/:commentId/reply', authenticateToken, addReplyToComment);

/**
 * @swagger
 * /api/comment/{commentId}/replies:
 *   get:
 *     summary: Obtenir les réponses d'un commentaire
 *     tags: [Commentaire]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du commentaire
 *     responses:
 *       200:
 *         description: Réponses récupérées avec succès
 *       404:
 *         description: Commentaire non trouvé
 *       500:
 *         description: Erreur interne du serveur
 */
commentRoute.get('/:commentId/replies', authenticateToken, getCommentReplies);

/**
 * @swagger
 * /api/comment/{commentId}/like:
 *   post:
 *     summary: Liker/disliker un commentaire
 *     tags: [Commentaire]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du commentaire
 *     responses:
 *       200:
 *         description: Like action effectuée avec succès
 *       404:
 *         description: Commentaire non trouvé
 *       500:
 *         description: Erreur interne du serveur
 */
commentRoute.post('/:commentId/like', authenticateToken, likeComment);

export default commentRoute;