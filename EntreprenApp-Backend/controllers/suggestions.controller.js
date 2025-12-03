import Event from "../models/event.model.js";
import Friend from "../models/friend.model.js";
import Post from "../models/post.model.js";
import Project from "../models/project.model.js";
import User from "../models/user.model.js";

export const getConnectionSuggestions = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Obtenir les amis actuels de l'utilisateur
    const existingFriends = await Friend.find({
      $or: [
        { sender: userId, status: 'accepted' },
        { receiver: userId, status: 'accepted' }
      ]
    });

    const friendIds = existingFriends.map(f => 
      f.sender.toString() === userId.toString() ? f.receiver : f.sender
    );
    
    // Exclure l'utilisateur lui-même
    friendIds.push(userId);

    // Obtenir les demandes de connexion en attente ou rejetées
    const pendingRequests = await Friend.find({
      $or: [
        { sender: userId },
        { receiver: userId }
      ],
      status: { $in: ['pending', 'rejected'] }
    });

    const pendingIds = pendingRequests.map(f => 
      f.sender.toString() === userId.toString() ? f.receiver : f.sender
    );

    // Suggérer des utilisateurs qui ne sont pas déjà amis et pas en demande
    const suggestions = await User.find({
      _id: { $nin: [...friendIds, ...pendingIds] }
    })
      .select('fullname username profileImage role email')
      .limit(10);

    res.status(200).json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    console.error("Error while fetching suggestions:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export const sendFriendRequest = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { targetUserId } = req.body;

    if (!targetUserId) {
      return res.status(400).json({
        success: false,
        message: "Target user ID is required"
      });
    }

    // Vérifier que le user cible existe
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Vérifier qu'il n'y a pas déjà une connexion
    const existingRequest = await Friend.findOne({
      $or: [
        { sender: senderId, receiver: targetUserId },
        { sender: targetUserId, receiver: senderId }
      ]
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: "Friend request already exists or you are already friends"
      });
    }

    // Créer une nouvelle demande de connexion
    const friendRequest = await Friend.create({
      sender: senderId,
      receiver: targetUserId,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: "Friend request sent successfully",
      data: friendRequest
    });
  } catch (error) {
    console.error("Error while sending friend request:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    // Récupérer les infos de l'utilisateur
    const user = await User.findById(userId).select('-password -verificationCode -verificationCodeExpireAt -resetPasswordToken -resetPasswordExpiresAt');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (!user.isVerified) {
      return res.status(404).json({
        success: false,
        message: "User account not activated"
      });
    }

    try {
      // Récupérer les événements de l'utilisateur (organisés ou auxquels il participe)
      const events = await Event.find({ 
        $or: [
          { organizer: userId },
          { 'registrations.user': userId }
        ]
      })
        .select('title description startDate endDate location image organizer registrations')
        .limit(6)
        .lean();

      // Formater les événements
      const formattedEvents = events.map(event => ({
        _id: event._id,
        title: event.title,
        description: event.description,
        startDate: event.startDate,
        endDate: event.endDate,
        location: event.location,
        image: event.image?.url || null,
        organizer: event.organizer,
        participants: event.registrations?.length || 0
      }));

      // Récupérer les programmes/projets de l'utilisateur
      const projects = await Project.find({
        $or: [
          { creator: userId },
          { members: userId }
        ]
      })
        .select('title description image status category creator members')
        .limit(6)
        .lean();

      // Récupérer les posts de l'utilisateur
      const posts = await Post.find({ author: userId })
        .select('title content media likes comments createdAt')
        .limit(5)
        .sort({ createdAt: -1 })
        .lean();

      const responseData = {
        user: user.toObject ? user.toObject() : user,
        events: formattedEvents || [],
        projects: projects || [],
        posts: posts || []
      };

      res.status(200).json({
        success: true,
        data: responseData
      });
    } catch (dbError) {
      console.error("Database error:", dbError);
      // Return user data even if events/projects fail
      const responseData = {
        user: user.toObject ? user.toObject() : user,
        events: [],
        projects: [],
        posts: []
      };
      
      res.status(200).json({
        success: true,
        data: responseData
      });
    }
  } catch (error) {
    console.error("Error while fetching user profile:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};
