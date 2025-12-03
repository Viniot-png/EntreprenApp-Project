import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: {type:String, default:''},
    visibility: {
        type: String,
        enum: ['private', 'public', 'connections'],
        default: 'public'
    },
    media: [
        {
            url: String,
            publicId: String, // Nécessaire pour supprimer de Cloudinary
            type: { type: String, enum: ['image', 'video', 'document'], default: 'image' }
        }
    ],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    bookmarkedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    sharesCount: { type: Number, default: 0 }
}, { timestamps: true });

const Post = mongoose.model('Post', postSchema);

export default Post;