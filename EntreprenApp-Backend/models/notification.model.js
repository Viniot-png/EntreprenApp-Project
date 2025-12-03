import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    actor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    type: {
        type: String,
        enum: ['message', 'post', 'friend_request', 'friend_accept', 'event', 'like', 'comment'],
        required: true
    },
    title: String,
    content: String,
    relatedItem: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'relatedItemType'
    },
    relatedItemType: {
        type: String,
        enum: ['Post', 'Message', 'User', 'Event', 'Challenge'],
        default: null
    },
    read: {
        type: Boolean,
        default: false
    },
    readAt: Date,
    createdAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        default: () => new Date(+new Date() + 30 * 24 * 60 * 60 * 1000) // Expire dans 30 jours
    }
});

// Index pour les requêtes courantes
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, read: 1 });

// TTL Index: supprimer automatiquement après expiration
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('Notification', notificationSchema);
