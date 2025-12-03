import Notification from '../models/notification.model.js';

/**
 * Crée une notification dans la base de données
 * @param {Object} data - Les données de notification
 * @returns {Promise<Object>} La notification créée
 */
export const createNotificationInDB = async (data) => {
    try {
        const notification = await Notification.create(data);
        // Populate après création en utilisant findById
        return await Notification.findById(notification._id)
            .populate('actor', 'fullname email profileImage role username')
            .populate('relatedItem');
    } catch (error) {
        console.error('Erreur création notification BD:', error);
        throw error;
    }
};

/**
 * Envoie une notification en temps réel via Socket.IO
 * @param {Object} data - Les données de la notification
 */
export const sendNotificationToUser = async (data) => {
    try {
        // Créer la notification en BD
        const notification = await createNotificationInDB(data);

        // Émettre via Socket.IO si disponible
        if (global.io && global.onlineUsers && notification.recipient) {
            const recipientSocketId = global.onlineUsers.get(notification.recipient.toString());
            if (recipientSocketId) {
                global.io.to(recipientSocketId).emit('new_notification', notification);
            }
        }

        return notification;
    } catch (error) {
        console.error('Erreur envoi notification:', error);
        throw error;
    }
};

/**
 * Crée et envoie une notification de message reçu
 */
export const notifyMessageReceived = async (senderId, receiverId, messageId, messageText) => {
    try {
        const notification = await sendNotificationToUser({
            recipient: receiverId,
            actor: senderId,
            type: 'message',
            title: 'Nouveau message',
            content: messageText || 'Vous avez reçu un nouveau message',
            relatedItem: senderId, // Use senderId so we can navigate to the conversation
            relatedItemType: 'User'
        });
        return notification;
    } catch (error) {
        console.error('Erreur notification message:', error);
    }
};

/**
 * Crée et envoie une notification de nouveau post
 */
export const notifyNewPost = async (authorId, followersIds, postId, postContent) => {
    try {
        const notifications = [];
        for (const followerId of followersIds) {
            if (followerId.toString() !== authorId.toString()) {
                const notification = await sendNotificationToUser({
                    recipient: followerId,
                    actor: authorId,
                    type: 'post',
                    title: 'Nouveau post',
                    content: postContent?.substring(0, 100) || 'Un nouvel utilisateur a publié un post',
                    relatedItem: postId,
                    relatedItemType: 'Post'
                });
                notifications.push(notification);
            }
        }
        return notifications;
    } catch (error) {
        console.error('Erreur notification post:', error);
    }
};

/**
 * Crée et envoie une notification de demande d'ami
 */
export const notifyFriendRequest = async (senderId, receiverId) => {
    try {
        const notification = await sendNotificationToUser({
            recipient: receiverId,
            actor: senderId,
            type: 'friend_request',
            title: 'Nouvelle demande d\'ami',
            content: 'Quelqu\'un vous a envoyé une demande d\'ami',
            relatedItem: senderId,
            relatedItemType: 'User'
        });
        return notification;
    } catch (error) {
        console.error('Erreur notification ami:', error);
    }
};

/**
 * Crée et envoie une notification d'acceptation de demande d'ami
 */
export const notifyFriendAccepted = async (senderId, receiverId) => {
    try {
        const notification = await sendNotificationToUser({
            recipient: receiverId,
            actor: senderId,
            type: 'friend_accept',
            title: 'Demande d\'ami acceptée',
            content: 'Votre demande d\'ami a été acceptée',
            relatedItem: senderId,
            relatedItemType: 'User'
        });
        return notification;
    } catch (error) {
        console.error('Erreur notification acceptation ami:', error);
    }
};

/**
 * Crée et envoie une notification de nouvel événement
 */
export const notifyNewEvent = async (organizerId, usersIds, eventId, eventTitle) => {
    try {
        const notifications = [];
        for (const userId of usersIds) {
            if (userId.toString() !== organizerId.toString()) {
                const notification = await sendNotificationToUser({
                    recipient: userId,
                    actor: organizerId,
                    type: 'event',
                    title: 'Nouvel événement',
                    content: `Un nouvel événement "${eventTitle}" a été créé`,
                    relatedItem: eventId,
                    relatedItemType: 'Event'
                });
                notifications.push(notification);
            }
        }
        return notifications;
    } catch (error) {
        console.error('Erreur notification événement:', error);
    }
};

/**
 * Crée et envoie une notification de like sur un post
 */
export const notifyPostLiked = async (likerId, postAuthorId, postId) => {
    try {
        if (likerId.toString() !== postAuthorId.toString()) {
            const notification = await sendNotificationToUser({
                recipient: postAuthorId,
                actor: likerId,
                type: 'like',
                title: 'Votre post a été aimé',
                content: 'Quelqu\'un a aimé votre post',
                relatedItem: postId,
                relatedItemType: 'Post'
            });
            return notification;
        }
    } catch (error) {
        console.error('Erreur notification like:', error);
    }
};

/**
 * Crée et envoie une notification de commentaire sur un post
 */
export const notifyPostCommented = async (commenterId, postAuthorId, postId, commentText) => {
    try {
        if (commenterId.toString() !== postAuthorId.toString()) {
            const notification = await sendNotificationToUser({
                recipient: postAuthorId,
                actor: commenterId,
                type: 'comment',
                title: 'Nouveau commentaire',
                content: commentText?.substring(0, 100) || 'Quelqu\'un a commenté votre post',
                relatedItem: postId,
                relatedItemType: 'Post'
            });
            return notification;
        }
    } catch (error) {
        console.error('Erreur notification commentaire:', error);
    }
};
