import express from "express";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { 
  createEvent, 
  deleteEvent, 
  GetAllEvents, 
  getSingleEvent, 
  registerToEvent, 
  updateEvent,
  unregisterFromEvent, 
  getEventRegistrations, 
  getMyEvents, 
  getMyRegistrations 
} from "../controllers/event.controller.js";
import authorizeRole from "../middlewares/role.middleware.js";
import { uploadEventImage } from "../utils/uploadMiddleware.js";

const eventRoute = express.Router();

/* ===== ROUTES SPÉCIFIQUES SANS PARAMS (AVANT les routes paramétrées) ===== */

/**
 * @swagger
 * /api/event:
 *   get:
 *     summary: Récupérer tous les événements
 *     tags: [Événement]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Liste des événements récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Event'
 *       500:
 *         description: Erreur interne du serveur
 */
eventRoute.get('/', authenticateToken, GetAllEvents);

/**
 * @swagger
 * /api/event/user/my-events:
 *   get:
 *     summary: Obtenir mes événements créés
 *     tags: [Événement]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Liste de mes événements créés
 *       500:
 *         description: Erreur interne du serveur
 */
eventRoute.get('/user/my-events', authenticateToken, getMyEvents);

/**
 * @swagger
 * /api/event/user/my-registrations:
 *   get:
 *     summary: Obtenir mes inscriptions
 *     tags: [Événement]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Liste des événements auxquels je suis inscrit
 *       500:
 *         description: Erreur interne du serveur
 */
eventRoute.get('/user/my-registrations', authenticateToken, getMyRegistrations);

/**
 * @swagger
 * /api/event/{id}:
 *   get:
 *     summary: Récupérer un événement par son ID
 *     tags: [Événement]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Événement récupéré avec succès
 *       404:
 *         description: Événement non trouvé
 *       500:
 *         description: Erreur interne du serveur
 */
eventRoute.get('/:id', authenticateToken, getSingleEvent);

/**
 * @swagger
 * /api/event/{id}/registrations:
 *   get:
 *     summary: Obtenir les inscriptions d'un événement (organisateur seulement)
 *     tags: [Événement]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des inscriptions
 *       403:
 *         description: Non autorisé
 *       404:
 *         description: Événement non trouvé
 *       500:
 *         description: Erreur interne du serveur
 */
eventRoute.get('/:id/registrations', authenticateToken, getEventRegistrations);

/* ===== POST ROUTES (CREATE) ===== */

/**
 * @swagger
 * /api/event:
 *   post:
 *     summary: Créer un nouvel événement avec image optionnelle
 *     tags: [Événement]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - startDate
 *               - endDate
 *               - location
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               location:
 *                 type: string
 *               seats:
 *                 type: integer
 *               price:
 *                 type: number
 *               isPaid:
 *                 type: boolean
 *               category:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Événement créé avec succès
 *       400:
 *         description: Données manquantes ou invalides
 *       500:
 *         description: Erreur interne du serveur
 */
// Alias route for frontend compatibility - MUST come BEFORE the generic '/' route
eventRoute.post('/create-event-with-image', authenticateToken, authorizeRole(['super_admin', 'admin', 'university', 'organisation']), uploadEventImage, createEvent);

eventRoute.post('/', authenticateToken, authorizeRole(['super_admin', 'admin', 'university', 'organisation']), uploadEventImage, createEvent);

/**
 * @swagger
 * /api/event/{id}/register:
 *   post:
 *     summary: S'inscrire à un événement
 *     tags: [Événement]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               paymentMethod:
 *                 type: string
 *     responses:
 *       200:
 *         description: Inscription réussie
 *       400:
 *         description: Déjà inscrit, événement complet ou fermé
 *       404:
 *         description: Événement non trouvé
 *       500:
 *         description: Erreur interne du serveur
 */
eventRoute.post('/:id/register', authenticateToken, registerToEvent);

/* ===== PUT ROUTES (UPDATE) ===== */

/**
 * @swagger
 * /api/event/{id}:
 *   put:
 *     summary: Mettre à jour un événement avec image optionnelle
 *     tags: [Événement]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               startDate:
 *                 type: string
 *               endDate:
 *                 type: string
 *               location:
 *                 type: string
 *               seats:
 *                 type: integer
 *               price:
 *                 type: number
 *               isPaid:
 *                 type: boolean
 *               category:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [Upcoming, Ongoing, Completed, Cancelled]
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Événement mis à jour avec succès
 *       400:
 *         description: Données invalides
 *       403:
 *         description: Non autorisé
 *       404:
 *         description: Événement non trouvé
 *       500:
 *         description: Erreur interne du serveur
 */
eventRoute.put('/:id', authenticateToken, uploadEventImage, updateEvent);

/* ===== DELETE ROUTES (DELETE) ===== */

/**
 * @swagger
 * /api/event/{id}:
 *   delete:
 *     summary: Supprimer un événement
 *     tags: [Événement]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Événement supprimé avec succès
 *       403:
 *         description: Non autorisé
 *       404:
 *         description: Événement non trouvé
 *       500:
 *         description: Erreur interne du serveur
 */
eventRoute.delete('/:id', authenticateToken, deleteEvent);

/**
 * @swagger
 * /api/event/{id}/unregister:
 *   delete:
 *     summary: Annuler l'inscription à un événement
 *     tags: [Événement]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Désinscription réussie
 *       400:
 *         description: Pas inscrit à cet événement
 *       404:
 *         description: Événement non trouvé
 *       500:
 *         description: Erreur interne du serveur
 */
eventRoute.delete('/:id/unregister', authenticateToken, unregisterFromEvent);
eventRoute.get('/:eventId/registrations', authenticateToken, getEventRegistrations);

export default eventRoute;