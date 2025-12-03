import express from "express";
import { applyToChallenge, createChallenge, deleteChallenge, getChallenge, getChallenges, selectApplicant, updateChallenge } from "../controllers/challenge.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import authorizeRole from "../middlewares/role.middleware.js";

const challengeRoute = express.Router();

/**
 * @swagger
 * /api/challenge/create-challenge:
 *   post:
 *     summary: Créer un nouveau défi
 *     tags: [Défi]
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
 *               deadline:
 *                 type: string
 *                 format: date-time
 *               fundingAmount:
 *                 type: number
 *     responses:
 *       201:
 *         description: Défi créé avec succès
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
 *                   $ref: '#/components/schemas/Challenge'
 *       400:
 *         description: Données manquantes ou invalides
 *       403:
 *         description: Non autorisé
 *       500:
 *         description: Erreur interne du serveur
 */
challengeRoute.post('/create-challenge', authenticateToken, authorizeRole(['admin','super_admin','organisation','university']), createChallenge);

/**
 * @swagger
 * /api/challenge:
 *   get:
 *     summary: Récupérer tous les défis
 *     tags: [Défi]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Liste des défis récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 challenges:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Challenge'
 *       500:
 *         description: Erreur interne du serveur
 */
challengeRoute.get('/', authenticateToken, getChallenges);

/**
 * @swagger
 * /api/challenge/{id}:
 *   get:
 *     summary: Récupérer un défi par son ID
 *     tags: [Défi]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du défi à récupérer
 *     responses:
 *       200:
 *         description: Défi récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Challenge'
 *       404:
 *         description: Défi non trouvé
 *       400:
 *         description: ID invalide
 *       500:
 *         description: Erreur interne du serveur
 */
challengeRoute.get('/:id', authenticateToken, getChallenge);

/**
 * @swagger
 * /api/challenge/{id}/edit:
 *   put:
 *     summary: Mettre à jour un défi existant
 *     tags: [Défi]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du défi à modifier
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
 *               deadline:
 *                 type: string
 *                 format: date-time
 *               fundingAmount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Défi mis à jour avec succès
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
 *                   $ref: '#/components/schemas/Challenge'
 *       400:
 *         description: Mise à jour non autorisée ou données invalides
 *       403:
 *         description: Non autorisé
 *       404:
 *         description: Défi non trouvé
 *       500:
 *         description: Erreur interne du serveur
 */
challengeRoute.put('/:id/edit', authenticateToken, authorizeRole(['admin','super_admin','organisation']), updateChallenge);

/**
 * @swagger
 * /api/challenge/{id}/delete:
 *   delete:
 *     summary: Supprimer un défi
 *     tags: [Défi]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du défi à supprimer
 *     responses:
 *       200:
 *         description: Défi supprimé avec succès
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
 *         description: Défi non trouvé
 *       500:
 *         description: Erreur interne du serveur
 */
challengeRoute.delete('/:id/delete', authenticateToken, authorizeRole(['admin','super_admin','organisation']), deleteChallenge);

/**
 * @swagger
 * /api/challenge/{id}/apply:
 *   post:
 *     summary: Postuler à un défi
 *     tags: [Postulation]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du défi concerné
 *     responses:
 *       200:
 *         description: Postulation réussie
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
 *                     challengeId:
 *                       type: string
 *                     applicantsCount:
 *                       type: integer
 *       400:
 *         description: Date limite dépassée ou déjà postulé
 *       404:
 *         description: Défi ou utilisateur non trouvé
 *       500:
 *         description: Erreur interne du serveur
 */
challengeRoute.post('/:id/apply', authenticateToken, applyToChallenge);

/**
 * @swagger
 * /api/challenge/{challengeId}/select/{applicantId}:
 *   post:
 *     summary: Sélectionner un candidat pour le défi
 *     tags: [Postulation]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: challengeId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du défi
 *       - in: path
 *         name: applicantId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du candidat à sélectionner
 *     responses:
 *       200:
 *         description: Candidat sélectionné avec succès
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
 *                     challengeId:
 *                       type: string
 *                     selectedCount:
 *                       type: integer
 *                     applicant:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *       400:
 *         description: Candidat non trouvé ou n'a pas postulé
 *       403:
 *         description: Non autorisé
 *       404:
 *         description: Défi ou candidat non trouvé
 *       500:
 *         description: Erreur interne du serveur
 */
challengeRoute.post('/:challengeId/select/:applicantId', authenticateToken, authorizeRole(['admin','super_admin','organisation']), selectApplicant);

export default challengeRoute;
