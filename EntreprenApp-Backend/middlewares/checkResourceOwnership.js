import Post from '../models/post.model.js';
import Event from '../models/event.model.js';
import User from '../models/user.model.js';
import { ApiError } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/apiResponse.js';

/**
 * Vérifie que l'utilisateur est propriétaire du post
 */
export const checkPostOwnership = asyncHandler(async (req, res, next) => {
  const { postId } = req.params;
  const userId = req.user._id;

  const post = await Post.findById(postId);
  
  if (!post) {
    throw new ApiError(404, 'Post non trouvé');
  }

  if (post.author.toString() !== userId.toString()) {
    throw new ApiError(
      403,
      'Vous n\'avez pas la permission de modifier ce post'
    );
  }

  req.post = post;
  next();
});

/**
 * Vérifie que l'utilisateur est propriétaire de l'événement
 */
export const checkEventOwnership = asyncHandler(async (req, res, next) => {
  const { eventId } = req.params;
  const userId = req.user._id;

  const event = await Event.findById(eventId);
  
  if (!event) {
    throw new ApiError(404, 'Événement non trouvé');
  }

  if (event.organizer.toString() !== userId.toString()) {
    throw new ApiError(
      403,
      'Vous n\'avez pas la permission de modifier cet événement'
    );
  }

  req.event = event;
  next();
});

/**
 * Vérifie que l'utilisateur est propriétaire du profil
 */
export const checkProfileOwnership = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const currentUserId = req.user._id;

  const user = await User.findById(userId);
  
  if (!user) {
    throw new ApiError(404, 'Utilisateur non trouvé');
  }

  if (userId !== currentUserId.toString()) {
    throw new ApiError(
      403,
      'Vous n\'avez pas la permission de modifier ce profil'
    );
  }

  req.profile = user;
  next();
});

/**
 * Vérifie que l'utilisateur peut supprimer une ressource (post, event, etc.)
 */
export const checkDeletePermission = asyncHandler(async (req, res, next) => {
  const { postId, eventId, userId } = req.params;
  const currentUserId = req.user._id;

  let resourceOwnerId = null;

  // Déterminer le propriétaire selon le type de ressource
  if (postId) {
    const post = await Post.findById(postId);
    if (!post) throw new ApiError(404, 'Post non trouvé');
    resourceOwnerId = post.author;
  } else if (eventId) {
    const event = await Event.findById(eventId);
    if (!event) throw new ApiError(404, 'Événement non trouvé');
    resourceOwnerId = event.organizer;
  } else if (userId) {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, 'Utilisateur non trouvé');
    resourceOwnerId = user._id;
  }

  if (resourceOwnerId.toString() !== currentUserId.toString()) {
    throw new ApiError(
      403,
      'Vous n\'avez pas la permission de supprimer cette ressource'
    );
  }

  next();
});
