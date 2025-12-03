import Comment from "../models/comment.model.js"
import Post from "../models/post.model.js";
import { notifyPostCommented } from "../utils/notificationService.js";

export const addComment = async (req, res) => {
  const { id } = req.params;
  
  try {
   
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Comment content is required"
      });
    }


    const newComment = await Comment.create({
      author: req.user._id,
      post: id,
      content
    });

  
    await Post.findByIdAndUpdate(id, {
      $push: { comments: newComment._id }
    }, { new: true });

   
    const populatedComment = await Comment.findById(newComment._id)
      .populate('author', 'fullname username email profileImage role');

    // Notify post author
    try {
      const post = await Post.findById(id);
      if (post && post.author.toString() !== req.user._id.toString()) {
        await notifyPostCommented(req.user._id, post.author, post._id, content);
      }
    } catch (notifErr) {
      console.error('Failed to send comment notification:', notifErr);
    }

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      data: populatedComment
    });
    
  } catch (err) {
    console.error("Error while adding comment:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};


export const updateComment = async (req, res) => {
  const { id } = req.params;
  
  try {
    // First find the comment
    const comment = await Comment.findById(id);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found"
      });
    }

    // Check if current user is authorized (author or admin)
    const isAuthor = comment.author.toString() === req.user._id.toString();
    const isAdmin = ['admin', 'super_admin'].includes(req.user.role);
    
    if (!isAuthor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized - You don't have permission to update this comment"
      });
    }

    // Update the comment
    const updatedComment = await Comment.findByIdAndUpdate(
      id, 
      { content: req.body.content }, 
      { new: true }
    ).populate('author', 'username profileImage');

    res.status(200).json({
      success: true,
      message: "Comment updated successfully",
      data: updatedComment
    });
    
  } catch (err) {
    console.error("Error while updating comment:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};


export const deleteComment = async (req, res) => {
  const { id } = req.params;
  
  try {
  
    const comment = await Comment.findById(id);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found"
      });
    }

   
    const isAuthor = comment.author.toString() === req.user._id.toString();
    const isAdmin = ['admin', 'super_admin'].includes(req.user.role);
    
    if (!isAuthor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized - You don't have permission to delete this comment"
      });
    }

    
    await Comment.findByIdAndDelete(id);
    await Post.findByIdAndUpdate(comment.post, {
      $pull: { comments: id }
    });

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully"
    });
    
  } catch (err) {
    console.error("Error while deleting comment:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};




export const getCommentsByPost = async (req, res) => {
  const { id } = req.params;
  
  try {
    const comments = await Comment.find({ post: id })
      .populate('author', 'fullname username email profileImage role')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: comments
    });
    
  } catch (err) {
    console.error("Error while fetching post comments:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export const getComment = async (req, res) => {
  const { id } = req.params;
  
  try {
  
    const comment = await Comment.findById(id);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found"
      });
    }


    res.status(200).json({
      success: true,
      data:comment
    });
    
  } catch (err) {
    console.error("Error while fetching single comment:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Ajouter une réponse à un commentaire
export const addReplyToComment = async (req, res) => {
  const { commentId } = req.params;
  
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Reply content is required"
      });
    }

    // Vérifier que le commentaire parent existe
    const parentComment = await Comment.findById(commentId);
    if (!parentComment) {
      return res.status(404).json({
        success: false,
        message: "Parent comment not found"
      });
    }

    // Créer la réponse
    const reply = await Comment.create({
      author: req.user._id,
      post: parentComment.post,
      content,
      parentComment: commentId
    });

    // Ajouter la réponse au commentaire parent
    await Comment.findByIdAndUpdate(
      commentId,
      { $push: { replies: reply._id } },
      { new: true }
    );

    // Populer la réponse
    const populatedReply = await Comment.findById(reply._id)
      .populate('author', 'fullname username email profileImage role');

    res.status(201).json({
      success: true,
      message: "Reply added successfully",
      data: populatedReply
    });

  } catch (err) {
    console.error("Error while adding reply:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Obtenir les réponses d'un commentaire
export const getCommentReplies = async (req, res) => {
  const { commentId } = req.params;
  
  try {
    const replies = await Comment.find({ parentComment: commentId })
      .populate('author', 'fullname username email profileImage role')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      data: replies
    });

  } catch (err) {
    console.error("Error while fetching comment replies:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Liker un commentaire
export const likeComment = async (req, res) => {
  const { commentId } = req.params;
  
  try {
    const comment = await Comment.findById(commentId);
    const userId = req.user._id;

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found"
      });
    }

    // Vérifier si l'utilisateur a déjà liké
    const likeIndex = comment.likes.findIndex(
      likeId => likeId.toString() === userId.toString()
    );

    if (likeIndex === -1) {
      // Ajouter le like
      comment.likes.push(userId);
      comment.likesCount = comment.likes.length;
    } else {
      // Retirer le like
      comment.likes.splice(likeIndex, 1);
      comment.likesCount = comment.likes.length;
    }

    await comment.save();

    res.status(200).json({
      success: true,
      message: likeIndex === -1 ? "Comment liked" : "Comment unliked",
      likesCount: comment.likesCount,
      isLiked: likeIndex === -1
    });

  } catch (err) {
    console.error("Error while liking comment:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};