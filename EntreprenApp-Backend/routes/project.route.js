import express from "express";
import { createProject, deleteProject, getProject, getProjects, investInProject, updateProject } from "../controllers/project.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import authorizeRole from "../middlewares/role.middleware.js";

const projectRoute = express.Router();

/**
 * @swagger
 * /api/project/create-project:
 *   post:
 *     summary: Créer un nouveau projet
 *     tags: [Projet]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               sector:
 *                 type: string
 *               stage:
 *                 type: string
 *                 example: "Idea"
 *               fundingGoal:
 *                 type: number
 *     responses:
 *       201:
 *         description: Projet créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 
 *                   $ref: '#/components/schemas/Project'
 *       400:
 *         description: Données manquantes ou invalides
 *       500:
 *         description: Erreur interne du serveur
 */
projectRoute.post('/create-project', authenticateToken, authorizeRole(['admin','super_admin','entrepreneur','startup']), createProject);

/**
 * @swagger
 * /api/project:
 *   get:
 *     summary: Récupérer tous les projets
 *     tags: [Projet]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Liste des projets récupérée avec succès
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
 *                     $ref: '#/components/schemas/Project'
 *       500:
 *         description: Erreur interne du serveur
 */
projectRoute.get('/', authenticateToken, getProjects);

/**
 * @swagger
 * /api/project/{id}:
 *   get:
 *     summary: Récupérer un projet par son ID
 *     tags: [Projet]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du projet à récupérer
 *     responses:
 *       200:
 *         description: Projet récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Project'
 *       404:
 *         description: Projet non trouvé
 *       400:
 *         description: ID invalide
 *       500:
 *         description: Erreur interne du serveur
 */
projectRoute.get('/:id', authenticateToken, getProject);

/**
 * @swagger
 * /api/project/{id}/edit:
 *   put:
 *     summary: Mettre à jour un projet existant
 *     tags: [Projet]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du projet à modifier
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               sector:
 *                 type: string
 *               stage:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Projet mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 
 *                   $ref: '#/components/schemas/Project'
 *       400:
 *         description: Mise à jour non autorisée ou données invalides
 *       403:
 *         description: Non autorisé
 *       404:
 *         description: Projet non trouvé
 *       500:
 *         description: Erreur interne du serveur
 */
projectRoute.put('/:id/edit', authenticateToken, updateProject);

/**
 * @swagger
 * /api/project/{id}/delete:
 *   delete:
 *     summary: Supprimer un projet
 *     tags: [Projet]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du projet à supprimer
 *     responses:
 *       200:
 *         description: Projet supprimé avec succès
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
 *         description: Projet non trouvé
 *       500:
 *         description: Erreur interne du serveur
 */
projectRoute.delete('/:id/delete', authenticateToken, deleteProject);

/**
 * @swagger
 * /api/project/{id}/invest:
 *   post:
 *     summary: Investir dans un projet
 *     tags: [Investissement]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du projet concerné
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 minimum: 1
 *     responses:
 *       200:
 *         description: Investissement réussi
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
 *                   type: object
 *                   properties:
 *                     projectId:
 *                       type: string
 *                     raisedAmount:
 *                       type: number
 *                     fundingGoal:
 *                       type: number
 *                     status:
 *                       type: string
 *       400:
 *         description: Montant invalide ou déjà investi
 *       404:
 *         description: Projet non trouvé
 *       500:
 *         description: Erreur interne du serveur
 */
projectRoute.post('/:id/invest', authenticateToken, authorizeRole('investor'), investInProject);

export default projectRoute;