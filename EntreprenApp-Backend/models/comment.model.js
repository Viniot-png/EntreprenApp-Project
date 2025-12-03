import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    content: { type: String, required: true },
    parentComment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null }, // Pour les réponses
    replies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }], // Réponses à ce commentaire
    likesCount: { type: Number, default: 0 },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] // Likes sur le commentaire
}, { timestamps: true });

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;