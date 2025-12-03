import Notification from '../models/notification.model.js';
import User from '../models/user.model.js';

// Créer une nouvelle notification
export const createNotification = async (data) => {
    try {
        const notification = await Notification.create(data);
        return await notification.populate('actor', 'fullname email avatar profileImage role');
    } catch (error) {
        console.error('Erreur création notification:', error);
        throw error;
    }
};

// Récupérer les notifications de l'utilisateur connecté
export const getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const notifications = await Notification.find({ recipient: userId })
            .populate('actor', 'fullname email avatar profileImage role')
            .populate('relatedItem')
            .sort({ createdAt: -1 })
            .limit(50);

        res.status(200).json({
            success: true,
            data: notifications
        });
    } catch (error) {
        console.error('Erreur récupération notifications:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des notifications',
            error: error.message
        });
    }
};

// Récupérer le nombre de notifications non lues
export const getUnreadCount = async (req, res) => {
    try {
        const userId = req.user.id;
        const count = await Notification.countDocuments({ 
            recipient: userId, 
            read: false 
        });

        res.status(200).json({
            success: true,
            unreadCount: count
        });
    } catch (error) {
        console.error('Erreur comptage notifications:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors du comptage des notifications',
            error: error.message
        });
    }
};

// Marquer une notification comme lue
export const markAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const userId = req.user.id;

        const notification = await Notification.findOneAndUpdate(
            { _id: notificationId, recipient: userId },
            { read: true, readAt: new Date() },
            { new: true }
        ).populate('actor', 'fullname email avatar profileImage role');

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification non trouvée'
            });
        }

        res.status(200).json({
            success: true,
            data: notification
        });
    } catch (error) {
        console.error('Erreur marquage notification:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors du marquage de la notification',
            error: error.message
        });
    }
};

// Marquer toutes les notifications comme lues
export const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.id;

        await Notification.updateMany(
            { recipient: userId, read: false },
            { read: true, readAt: new Date() }
        );

        res.status(200).json({
            success: true,
            message: 'Toutes les notifications ont été marquées comme lues'
        });
    } catch (error) {
        console.error('Erreur marquage notifications:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors du marquage des notifications',
            error: error.message
        });
    }
};

// Supprimer une notification
export const deleteNotification = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const userId = req.user.id;

        // Si notificationId === "all", supprimer TOUTES les notifications de l'utilisateur
        if (notificationId === "all") {
            const result = await Notification.deleteMany({ recipient: userId });
            return res.status(200).json({
                success: true,
                message: 'Toutes les notifications supprimées',
                deletedCount: result.deletedCount
            });
        }

        const notification = await Notification.findOneAndDelete(
            { _id: notificationId, recipient: userId }
        );

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification non trouvée'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Notification supprimée'
        });
    } catch (error) {
        console.error('Erreur suppression notification:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression de la notification',
            error: error.message
        });
    }
};

// Supprimer toutes les notifications
export const deleteAllNotifications = async (req, res) => {
    try {
        const userId = req.user.id;

        await Notification.deleteMany({ recipient: userId });

        res.status(200).json({
            success: true,
            message: 'Toutes les notifications ont été supprimées'
        });
    } catch (error) {
        console.error('Erreur suppression notifications:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression des notifications',
            error: error.message
        });
    }
};
