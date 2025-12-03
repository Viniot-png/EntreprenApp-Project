import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import Friend from "../models/friend.model.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import { deleteFromCloudinary, extractPublicId } from "../utils/mediaHelpers.js";
import { notifyNewPost, notifyPostLiked, notifyPostCommented } from "../utils/notificationService.js";

// Create a post


export const createPost = async (req, res, next) => {
  try {
    const { content, visibility } = req.body;

    if (!content?.trim() && (!req.files || req.files.length === 0)) {
      return res.status(400).json({
        success: false,
        message: "Post must contain either text content or at least one image/video",
      });
    }

    // Validate visibility
    if (visibility && !['private', 'public', 'connections'].includes(visibility)) {
      return res.status(400).json({
        success: false,
        message: "Invalid visibility option. Must be 'private', 'public', or 'connections'",
      });
    }

    // Process uploaded files - normalize media type
    // IMPORTANT: Cloudinary retourne secure_url, public_id, resource_type
    const mediaUploads = (req.files && Array.isArray(req.files)) ? req.files.map(file => {
      // Determine media type - check URL if resource_type not available
      const urlPath = file.path || file.url || '';
      let mediaType = 'image';
      
      if (file.resource_type === 'video') {
        mediaType = 'video';
      } else if (file.resource_type === 'raw') {
        mediaType = 'document';
      } else if (urlPath.includes('/video/')) {
        mediaType = 'video';
      } else if (urlPath.match(/\.(mp4|webm|avi|mov|mkv|flv|wmv|ogv|m4v|mpg|mpeg|3gp)$/i)) {
        mediaType = 'video';
      } else if (urlPath.match(/\.(pdf|doc|docx|txt|xlsx|xls|ppt|pptx|odt|rtf)$/i)) {
        mediaType = 'document';
      }
      
      return {
        url: file.secure_url || file.url || file.path, // Cloudinary retourne secure_url
        publicId: extractPublicId(file), // Extract public_id robustement
        type: mediaType
      };
    }) : [];

    const newPost = await Post.create({
      author: req.user._id,
      content,
      visibility: visibility || 'public', // default to public if not specified
      media: mediaUploads
    });

    // Notify followers of new post
    try {
      const author = await User.findById(req.user._id);
      if (author && author.friends && author.friends.length > 0) {
        await notifyNewPost(req.user._id, author.friends, newPost._id, content);
      }
    } catch (notifErr) {
      console.error('Failed to send post notification:', notifErr);
    }

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      data: newPost,
    });
  } catch (error) {
    console.error("Error while creating post:", error.message || error);
    if (error.name === 'ValidationError') {
      console.error("[DEBUG POST] Validation errors:", error.errors);
    }
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


export const deletePost = async (req, res) => {
  const { id } = req.params;
  
  try {
  
    const post = await Post.findById(id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    
    const isAuthor = post.author.toString() === req.user._id.toString();
    const isAdmin = ['admin', 'super_admin'].includes(req.user.role);
    
    if (!isAuthor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized - You don't have permission to delete this post"
      });
    }

    // Supprimer les fichiers de Cloudinary
    if (post.media && Array.isArray(post.media) && post.media.length > 0) {
      try {
        await Promise.all(
          post.media.map(mediaItem => {
            if (mediaItem.publicId) {
              return deleteFromCloudinary(mediaItem.url, mediaItem.type || 'image');
            }
          })
        );
      } catch (cloudinaryErr) {
        console.error("Error deleting media from Cloudinary:", cloudinaryErr);
        // Continue with post deletion even if Cloudinary deletion fails
      }
    }
    
    await Post.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (err) {
    console.error("Error while deleting post:", err);
    res.status(500).json({ 
      success: false,
      message: "Internal server error"
    });
  }
};

export const likePost = async (req, res) => {
  const { id } = req.params; 
  
  try {
    
    const post = await Post.findById(id);
    const userId = req.user._id; 

    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    // Check if user already liked the post
    const userIndex = post.likes.findIndex(
      likeId => likeId.toString() === userId.toString()
    );

    let message = '';
    

    if (userIndex === -1) {
      post.likes.push(userId);
      message = "Post liked successfully";
      
      // Notify post author
      try {
        if (post.author.toString() !== userId.toString()) {
          await notifyPostLiked(userId, post.author, post._id);
        }
      } catch (notifErr) {
        console.error('Failed to send like notification:', notifErr);
      }
    } 
    

    else {
      post.likes.splice(userIndex, 1);
      message = "Post unliked successfully";
    }

    
    await post.save();

    
    res.status(200).json({
      success: true,
      message,
      likesCount: post.likes.length,
      isLiked: userIndex === -1 
    });
  } catch (err) {
    console.error("Error while processing like action:", err);
    res.status(500).json({ 
      success: false,
      message: "Internal server error"
    });
  }
};


export const MyPosts = async (req, res) => {
  try {
  
    const posts = await Post.find({ author: req.user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: 'author',
        select: 'fullname username email profileImage role'
      })
      .populate({
        path: 'likes',
        select: 'username profileImage'
      })
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'username profileImage fullname role'
        }
      });

    if (!posts || posts.length === 0) {
      return res.status(200).json({
        success: true,
        message: "You haven't created any posts yet",
        data: []
      });
    }

    res.status(200).json({
      success: true,
      count: posts.length,
      data: posts
    });

  } catch (error) {
    console.error("Error while fetching user posts:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error"
    }); 
  }
}


export const getPostById = async (req, res) => {
  const {id} = req.params;
  try {
    const post = await Post.findById(id)
      .populate({
        path: 'author',
        select: 'fullname username email profileImage role'
      })
      .populate({
        path: 'likes',
        select: 'username profileImage'
      })
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'username profileImage fullname role'
        }
      });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    // Compute isLiked (handle populated likes or raw ObjectIds)
    const computeIsLiked = () => {
      if (!req.user || !Array.isArray(post.likes)) return false;
      return post.likes.some(like => {
        try {
          if (like && (like._id || like.id)) {
            return (like._id || like.id).toString() === req.user._id.toString();
          }
          return like.toString() === req.user._id.toString();
        } catch (e) {
          return false;
        }
      });
    };

    // Create plain object and attach isLiked flag for responses
    const postObj = post.toObject();
    postObj.isLiked = computeIsLiked();

    // Vérifier les autorisations d'accès for private posts
    if (post.visibility === 'private' && (!req.user || post.author.toString() !== req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this post"
      });
    }

    if (post.visibility === 'connections' && req.user) {
      // Vérifier si l'utilisateur est l'auteur
      if (post.author.toString() === req.user._id.toString()) {
        return res.status(200).json({
          success: true,
          data: postObj
        });
      }

      // Vérifier si l'utilisateur est connecté avec l'auteur
      const connection = await Friend.findOne({
        $or: [
          { user: req.user._id, friend: post.author, status: 'accepted' },
          { user: post.author, friend: req.user._id, status: 'accepted' }
        ]
      });

      if (!connection) {
        return res.status(403).json({
          success: false,
          message: "You need to be connected with the author to view this post"
        });
      }
    }

    // Si le post est public ou si toutes les vérifications sont passées
    res.status(200).json({
      success: true,
      data: postObj
    });

  } catch (error) {
    console.error("Error while fetching user post by id:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error"
    }); 
  }
}




export const getAllPublicPost = async (req, res) => {
  try {
    // Pagination parameters
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, Math.min(50, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;
    
    let query = { visibility: 'public' };  // Default query for non-authenticated users

    // Only add additional conditions if user is authenticated
    if (req.user) {
      let userConnections = [];
      
      // Get user's connections
      const friends = await Friend.find({
        $or: [
          { user: req.user._id, status: 'accepted' },
          { friend: req.user._id, status: 'accepted' }
        ]
      });

      userConnections = friends.map(f => 
        f.user.toString() === req.user._id.toString() ? f.friend : f.user
      );

      // Build query based on visibility and user authentication
      query = {
        $or: [
          { visibility: 'public' },
          { author: req.user._id }, // User's own posts
          { visibility: 'connections', author: { $in: userConnections } } // Posts from connections
        ]
      };
    }
  
    // Get total count for pagination
    const totalPosts = await Post.countDocuments(query);
    const totalPages = Math.ceil(totalPosts / limit);
    
    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'author',
        select: 'fullname username email profileImage role'
      })
      .populate({
        path: 'likes',
        select: 'username profileImage'
      })
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'username profileImage fullname role'
        }
      });

    if (!posts || posts.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No post yet",
        data: [],
        pagination: {
          page,
          limit,
          totalPosts,
          totalPages,
          hasNextPage: page < totalPages
        }
      });
    }

    // Ajouter isLiked pour chaque post basé sur l'utilisateur courant
    const postsWithLikes = posts.map(post => {
      const postObj = post.toObject();
      // Likes can be populated user objects or ObjectIds - handle both
      postObj.isLiked = false;
      if (req.user && Array.isArray(post.likes)) {
        postObj.isLiked = post.likes.some(like => {
          try {
            if (like && (like._id || like.id)) {
              return (like._id || like.id).toString() === req.user._id.toString();
            }
            return like.toString() === req.user._id.toString();
          } catch (e) {
            return false;
          }
        });
      }
      return postObj;
    });

    res.status(200).json({
      success: true,
      count: postsWithLikes.length,
      data: postsWithLikes,
      pagination: {
        page,
        limit,
        totalPosts,
        totalPages,
        hasNextPage: page < totalPages
      }
    });

  } catch (error) {
    console.error("Error while fetching user posts:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error"
    }); 
  }
}



export const editPost = async (req, res) => {
  uploadMedia(req, res, async (err) => {
    try {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message || 'File upload error'
        });
      }

      const { id } = req.params;
      const { content, mediaToDelete } = req.body;

      // Initialize update object
      const updateData = {};
      
      // Find the existing post
      const existingPost = await Post.findById(id);
      if (!existingPost) {
        return res.status(404).json({
          success: false,
          message: "Post not found"
        });
      }

      // Check authorization: admin, super_admin, or author
      const isAuthor = existingPost.author.toString() === req.user._id.toString();
      const isAdmin = req.user.role === 'admin';
      const isSuperAdmin = req.user.role === 'super_admin';
      
      if (!isAuthor && !isAdmin && !isSuperAdmin) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized: Only author or administrators can edit this post"
        });
      }

      // Handle content update
      if (content) {
        updateData.content = content;
      }

      // Handle media deletions
      if (mediaToDelete) {
        const idsToDelete = Array.isArray(mediaToDelete) ? mediaToDelete : [mediaToDelete];
        
        // Delete from Cloudinary
        await Promise.all(idsToDelete.map(publicId => 
          cloudinary.uploader.destroy(publicId)
        ));

        // Filter out deleted media
        updateData.$pull = {
          media: { publicId: { $in: idsToDelete } }
        };
      }

      // Handle new media uploads - normalize media type
      if (req.files && req.files.length > 0) {
        const newMedia = req.files.map(file => {
          // Determine media type - check URL if resource_type not available
          const urlPath = file.path || file.url || '';
          let mediaType = 'image';
          
          if (file.resource_type === 'video') {
            mediaType = 'video';
          } else if (file.resource_type === 'raw') {
            mediaType = 'document';
          } else if (urlPath.includes('/video/')) {
            mediaType = 'video';
          } else if (urlPath.match(/\.(mp4|webm|avi|mov|mkv|flv|wmv|ogv|m4v|mpg|mpeg|3gp)$/i)) {
            mediaType = 'video';
          } else if (urlPath.match(/\.(pdf|doc|docx|txt|xlsx|xls|ppt|pptx|odt|rtf)$/i)) {
            mediaType = 'document';
          }
          
          return {
            url: file.secure_url || file.url || file.path, // Cloudinary retourne secure_url
            publicId: extractPublicId(file), // Use helper function for robust extraction
            type: mediaType
          };
        });

        updateData.$push = {
          media: { $each: newMedia }
        };
      }

      // Perform the update
      const updatedPost = await Post.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).populate('author', 'username profileImage');

      res.status(200).json({
        success: true,
        message: "Post updated successfully",
        data: updatedPost
      });


    } catch (error) {
      console.error("Error while editing post:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  });
};

// Bookmark endpoints
export const toggleBookmark = async (req, res) => {
  const { id } = req.params;
  
  try {
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    const userId = req.user._id;
    
    // Check if already bookmarked
    if (!post.bookmarkedBy) {
      post.bookmarkedBy = [];
    }

    const bookmarkIndex = post.bookmarkedBy.findIndex(
      id => id.toString() === userId.toString()
    );

    if (bookmarkIndex === -1) {
      // Add bookmark
      post.bookmarkedBy.push(userId);
    } else {
      // Remove bookmark
      post.bookmarkedBy.splice(bookmarkIndex, 1);
    }

    await post.save();

    res.status(200).json({
      success: true,
      message: bookmarkIndex === -1 ? "Post bookmarked" : "Post unbookmarked",
      isBookmarked: bookmarkIndex === -1
    });
  } catch (error) {
    console.error("Error while toggling bookmark:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export const getBookmarks = async (req, res) => {
  try {
    const posts = await Post.find({ 
      bookmarkedBy: req.user._id 
    })
      .sort({ createdAt: -1 })
      .populate('author', 'fullname username profileImage role')
      .populate({
        path: 'likes',
        select: 'username profileImage'
      })
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'username profileImage fullname role'
        }
      });

    res.status(200).json({
      success: true,
      count: posts.length,
      data: posts
    });
  } catch (error) {
    console.error("Error while fetching bookmarks:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export const isBookmarked = async (req, res) => {
  const { id } = req.params;
  
  try {
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    const isBookmarked = post.bookmarkedBy && 
      post.bookmarkedBy.some(userId => userId.toString() === req.user._id.toString());

    res.status(200).json({
      success: true,
      isBookmarked
    });
  } catch (error) {
    console.error("Error while checking bookmark:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};