import express from 'express';
import * as notificationController from '../controllers/notification.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Toutes les routes de notification nécessitent une authentification
router.use(authenticateToken);

// Récupérer le nombre de notifications non lues (MUST come before :notificationId route)
router.get('/unread/count', notificationController.getUnreadCount);

// Récupérer toutes les notifications
router.get('/', notificationController.getNotifications);

// Marquer toutes les notifications comme lues (MUST come before /:notificationId route)
router.put('/read/all', notificationController.markAllAsRead);

// Marquer une notification comme lue
router.put('/:notificationId/read', notificationController.markAsRead);

// Supprimer une notification
router.delete('/:notificationId', notificationController.deleteNotification);

// Supprimer toutes les notifications
router.delete('/all', notificationController.deleteAllNotifications);

export default router;
