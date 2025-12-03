import express from "express";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { createPost, deletePost, editPost, getAllPublicPost, likePost, getPostById, MyPosts, toggleBookmark, getBookmarks, isBookmarked } from "../controllers/post.controller.js";
import { recordShare, getSharesCount } from "../controllers/share.controller.js";
import { uploadMedia } from "../utils/uploadMiddleware.js";

const postRoute = express.Router();

/**
 * @swagger
 * /api/post/create-post:
 *   post:
 *     summary: Créer un nouveau post avec contenu et/ou médias
 *     tags: [Post]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: Contenu textuel du post
 *               visibility:
 *                 type: string
 *                 enum: [private, public, connections]
 *                 description: Niveau de visibilité du post
 *               media:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Médias à télécharger (images, vidéos)
 *     responses:
 *       201:
 *         description: Post créé avec succès
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
 *                   $ref: '#/components/schemas/Post'
 *       400:
 *         description: Contenu ou média requis
 *       500:
 *         description: Erreur interne du serveur
 */
postRoute.post('/create-post', authenticateToken, uploadMedia, createPost);

/**
 * @swagger
 * /api/post:
 *   get:
 *     summary: Récupérer tous les posts de l'utilisateur connecté
 *     tags: [Post]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Liste des posts récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Post'
 *       404:
 *         description: Aucun post trouvé
 *       500:
 *         description: Erreur interne du serveur
 */
postRoute.get('/', authenticateToken, MyPosts);

/**
 * @swagger
 * /api/post/public:
 *   get:
 *     summary: Récupérer tous les posts publics
 *     tags: [Post]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Posts publics récupérés avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Post'
 *       404:
 *         description: Aucun post trouvé
 *       500:
 *         description: Erreur interne du serveur
 */
import { optionalAuthenticateToken } from "../middlewares/optional.auth.middleware.js";

postRoute.get('/public', optionalAuthenticateToken, getAllPublicPost);

/**
 * @swagger
 * /api/post/{id}:
 *   get:
 *     summary: Récupérer un post par son ID
 *     tags: [Post]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du post à récupérer
 *     responses:
 *       200:
 *         description: Post récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Post'
 *       404:
 *         description: Post non trouvé
 *       500:
 *         description: Erreur interne du serveur
 */
postRoute.get('/:id', optionalAuthenticateToken, getPostById);

/**
 * @swagger
 * /api/post/like/{id}:
 *   post:
 *     summary: Aimer ou désaimer un post
 *     tags: [Post]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du post à aimer/désaimer
 *     responses:
 *       200:
 *         description: Action "like" traitée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 likesCount:
 *                   type: integer
 *                 isLiked:
 *                   type: boolean
 *       404:
 *         description: Post non trouvé
 *       500:
 *         description: Erreur interne du serveur
 */
postRoute.post('/like/:id', authenticateToken, likePost);

/**
 * @swagger
 * /api/post/delete/{id}:
 *   delete:
 *     summary: Supprimer un post
 *     tags: [Post]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du post à supprimer
 *     responses:
 *       200:
 *         description: Post supprimé avec succès
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
 *         description: Non autorisé
 *       404:
 *         description: Post non trouvé
 *       500:
 *         description: Erreur interne du serveur
 */
postRoute.delete('/delete/:id', authenticateToken, deletePost);

/**
 * @swagger
 * /api/post/edit/{id}:
 *   put:
 *     summary: Mettre à jour un post existant
 *     tags: [Post]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du post à modifier
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: Nouveau contenu du post
 *               visibility:
 *                 type: string
 *                 enum: [private, public, connections]
 *                 description: Niveau de visibilité du post
 *               mediaToDelete:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Liste des IDs des médias à supprimer
 *               media:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Nouveaux médias à ajouter
 *     responses:
 *       200:
 *         description: Post mis à jour avec succès
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
 *                   $ref: '#/components/schemas/Post'
 *       400:
 *         description: Données invalides
 *       403:
 *         description: Non autorisé
 *       404:
 *         description: Post non trouvé
 *       500:
 *         description: Erreur interne du serveur
 */
postRoute.put('/edit/:id', authenticateToken, editPost);

/**
 * @swagger
 * /api/post/bookmark/{id}:
 *   post:
 *     summary: Ajouter/retirer un post des favoris
 *     tags: [Post]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du post à mettre en favori
 *     responses:
 *       200:
 *         description: Action de favori traitée avec succès
 *       404:
 *         description: Post non trouvé
 *       500:
 *         description: Erreur interne du serveur
 */
postRoute.post('/bookmark/:id', authenticateToken, toggleBookmark);

/**
 * @swagger
 * /api/post/bookmarks:
 *   get:
 *     summary: Récupérer tous les posts marqués comme favoris
 *     tags: [Post]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Liste des favoris récupérée
 *       500:
 *         description: Erreur interne du serveur
 */
postRoute.get('/bookmarks', authenticateToken, getBookmarks);

/**
 * @swagger
 * /api/post/is-bookmarked/{id}:
 *   get:
 *     summary: Vérifier si un post est en favori
 *     tags: [Post]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du post à vérifier
 *     responses:
 *       200:
 *         description: Statut favori retourné
 *       404:
 *         description: Post non trouvé
 *       500:
 *         description: Erreur interne du serveur
 */
postRoute.get('/is-bookmarked/:id', authenticateToken, isBookmarked);

/**
 * @swagger
 * /api/post/share/{id}:
 *   post:
 *     summary: Enregistrer un partage de post
 *     tags: [Post]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Partage enregistré avec succès
 *       404:
 *         description: Post non trouvé
 *       500:
 *         description: Erreur interne du serveur
 */
postRoute.post('/share/:id', authenticateToken, recordShare);

/**
 * @swagger
 * /api/post/shares/{id}:
 *   get:
 *     summary: Obtenir le nombre de partages d'un post
 *     tags: [Post]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Nombre de partages retourné
 *       404:
 *         description: Post non trouvé
 *       500:
 *         description: Erreur interne du serveur
 */
postRoute.get('/shares/:id', getSharesCount);

export default postRoute;