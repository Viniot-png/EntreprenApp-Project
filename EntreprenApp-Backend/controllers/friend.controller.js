import Friends from "../models/friend.model.js";
import User from "../models/user.model.js";
import { notifyFriendRequest, notifyFriendAccepted } from "../utils/notificationService.js";

export const sendFriendRequest = async (req, res) => {
    try {
        const { receiverId } = req.body;
        const senderId = req.user._id;

        const existing = await Friends.findOne({ sender: senderId, receiver: receiverId });
        if (existing) return res.status(400).json({success:false,message: 'Request already sent' });

        const newRequest = await Friends.create({ sender: senderId, receiver: receiverId});
        
        // Notify receiver
        try {
          await notifyFriendRequest(senderId, receiverId);
        } catch (notifErr) {
          console.error('Failed to send friend request notification:', notifErr);
        }
        
        res.status(201).json({success:true,message:"Request send successfully",data:newRequest});
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


export const respondToFriendRequest = async (req, res) => {
  const { requestId } = req.params;
  const { action } = req.body; 

  if (!['accepted', 'rejected'].includes(action)) {
    return res.status(400).json({ success: false, message: 'Invalid action. Must be "accepted" or "rejected".' });
  }

  try {
    const request = await Friends.findById(requestId);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Friend request not found.' });
    }

    // Ensure only the receiver can respond
    if (request.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You are not authorized to respond to this request.' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Friend request already ${request.status}.` });
    }

    // Accept logic: Add users to each other's friends list
    if (action === 'accepted') {
      await User.findByIdAndUpdate(request.sender, { $addToSet: { friends: request.receiver } });
      await User.findByIdAndUpdate(request.receiver, { $addToSet: { friends: request.sender } });
      
      // Notify sender that request was accepted
      try {
        await notifyFriendAccepted(req.user._id, request.sender);
      } catch (notifErr) {
        console.error('Failed to send acceptance notification:', notifErr);
      }
    }

    // Update request status
    request.status = action;
    await request.save();

    res.status(200).json({
      success: true,
      message: `Friend request successfully ${action}.`,
      data: request
    });

  } catch (err) {
    console.error('Error responding to friend request:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message
    });
  }
};



export const getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('friends', 'fullname email profileImage');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      count: user.friends.length,
      friends: user.friends
    });
  } catch (err) {
    console.error("Error getting friends:", err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};



export const getPendingFriendRequests = async (req, res) => {
  try {
    const requests = await Friends.find({
      receiver: req.user._id,
      status: 'pending'
    })
      .populate('sender', 'fullname email profileImage');

    res.status(200).json({
      success: true,
      count: requests.length,
      pendingRequests: requests
    });
  } catch (err) {
    console.error("Error getting pending requests:", err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const currentUser = await User.findById(currentUserId).select('friends');
    
    // Get all users except current user
    const allUsers = await User.find(
      { _id: { $ne: currentUserId } },
      'fullname username email profileImage role location company bio'
    );

    // Get all friend requests (both sent and received)
    const sentRequests = await Friends.find({ sender: currentUserId });
    const receivedRequests = await Friends.find({ receiver: currentUserId });

    // Enrich users with friendship status
    const usersWithStatus = allUsers.map(user => {
      const isFriend = currentUser?.friends?.some(friendId => friendId.toString() === user._id.toString());
      
      const sentRequest = sentRequests.find(req => req.receiver.toString() === user._id.toString());
      const receivedRequest = receivedRequests.find(req => req.sender.toString() === user._id.toString());

      return {
        id: user._id,
        fullname: user.fullname,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
        role: user.role,
        location: user.location,
        company: user.company,
        bio: user.bio,
        status: isFriend ? 'friend' : sentRequest?.status || receivedRequest?.status || 'none',
        requestId: sentRequest?._id || receivedRequest?._id || null,
        requestDirection: sentRequest ? 'sent' : receivedRequest ? 'received' : null,
      };
    });

    res.status(200).json({
      success: true,
      count: usersWithStatus.length,
      users: usersWithStatus
    });
  } catch (err) {
    console.error("Error getting all users:", err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

export const removeFriend = async (req, res) => {
  try {
    const { friendId } = req.params;
    const currentUserId = req.user._id;

    if (!friendId) {
      return res.status(400).json({ success: false, message: 'Friend ID is required' });
    }

    // Remove friend from both users' friend lists
    await User.findByIdAndUpdate(currentUserId, { $pull: { friends: friendId } });
    await User.findByIdAndUpdate(friendId, { $pull: { friends: currentUserId } });

    res.status(200).json({
      success: true,
      message: 'Friend removed successfully'
    });
  } catch (err) {
    console.error('Error removing friend:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message
    });
  }
};