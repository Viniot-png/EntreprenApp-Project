import cloudinary from "cloudinary";
import mongoose from 'mongoose';
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import { notifyMessageReceived } from "../utils/notificationService.js";

export const GetMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const senderId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(userToChatId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const messages = await Message.find({
      $or: [
        { senderId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: senderId }
      ]
    }).sort({ createdAt: 1 });

    // Mark messages from the other participant as read for the current user
    try {
      await Message.updateMany({ senderId: userToChatId, receiverId: senderId, read: false }, { $set: { read: true } });
    } catch (e) {
      console.error('Failed to mark messages as read:', e);
    }
    res.status(200).json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to retrieve messages' });
  }
};

export const GetConversations = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    // Fetch all messages involving the current user
    const msgs = await Message.find({
      $or: [ { senderId: currentUserId }, { receiverId: currentUserId } ]
    }).sort({ createdAt: -1 });

    // Aggregate conversations by other participant
    const map = new Map();

    msgs.forEach((m) => {
      const otherId = m.senderId.toString() === currentUserId.toString() ? m.receiverId.toString() : m.senderId.toString();
      if (!map.has(otherId)) {
        map.set(otherId, {
          participantId: otherId,
          lastMessage: m.text || '',
          lastMessageAt: m.createdAt,
          unreadCount: 0,
        });
      }

      // Count unread messages for this conversation (messages received by current user that are not read)
      if (m.receiverId.toString() === currentUserId.toString() && !m.read) {
        const conv = map.get(otherId);
        conv.unreadCount = (conv.unreadCount || 0) + 1;
        map.set(otherId, conv);
      }
    });

    // Convert map to array and enrich with user info
    const conversations = [];
    for (const [otherId, data] of map.entries()) {
      const user = await User.findById(otherId).select('fullname username email profileImage role location company bio');
      conversations.push({
        id: otherId,
        participant: user || { id: otherId },
        lastMessage: data.lastMessage,
        lastMessageAt: data.lastMessageAt,
        unreadCount: data.unreadCount || 0
      });
    }

    // Sort by lastMessageAt descending
    conversations.sort((a,b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));

    res.status(200).json({ success: true, count: conversations.length, conversations });
  } catch (err) {
    console.error('Error getting conversations:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch conversations' });
  }
};


export const SendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    let { id: receiverId } = req.params;
    const senderId = req.user._id;

    // Validate that we have either text or image
    if ((!text || !text.trim()) && !image) {
      return res.status(400).json({ message: 'Message must contain text or an image' });
    }

    // Convert receiverId to MongoDB ObjectId if it's a valid format
    // Accept both ObjectId strings and numeric IDs (will pad with zeros if needed)
    try {
      // Try to create an ObjectId from the provided ID
      if (mongoose.Types.ObjectId.isValid(receiverId)) {
        receiverId = new mongoose.Types.ObjectId(receiverId);
      } else {
        return res.status(400).json({ message: 'Invalid receiver ID format' });
      }
    } catch (idErr) {
      console.error('ID conversion error:', idErr);
      return res.status(400).json({ message: 'Invalid receiver ID' });
    }

    let imageUrl = null;

    // If files uploaded via multipart (multer -> CloudinaryStorage), use the first file
    if (req.files && req.files.length > 0) {
      const file = req.files[0];
      imageUrl = file.path || file.secure_url || file.url || null;
    } else if (image) {
      try {
        const uploadResponse = await cloudinary.uploader.upload(image, {
          folder: 'chat_messages',
        });
        imageUrl = uploadResponse.secure_url;
      } catch (cloudinaryErr) {
        console.error('Cloudinary upload error:', cloudinaryErr);
        return res.status(400).json({ message: 'Image upload failed' });
      }
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text: text.trim(),
      image: imageUrl,
    });

    await newMessage.save();
    
    // Notify receiver of new message
    try {
      await notifyMessageReceived(senderId, receiverId, newMessage._id, text);
    } catch (notifErr) {
      console.error('Failed to send notification:', notifErr);
      // Don't fail the entire request if notification fails
    }
    
    // Emit real-time event to receiver if connected via Socket.IO
    try {
      if (global && global.io && global.onlineUsers) {
        const receiverSocketId = global.onlineUsers.get(receiverId?.toString());
        if (receiverSocketId) {
          global.io.to(receiverSocketId).emit('receive_message', newMessage);
        }
        // Also emit to sender socket if present to get immediate update
        const senderSocketId = global.onlineUsers.get(senderId?.toString());
        if (senderSocketId) {
          global.io.to(senderSocketId).emit('message_sent', newMessage);
        }
      }
    } catch (emitErr) {
      console.error('Socket emit error:', emitErr);
    }

    res.status(201).json({ success: true, data: newMessage });
  } catch (error) {
    console.error('SendMessage error:', error);
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors)
        .map(err => err.message)
        .join(', ');
      return res.status(400).json({ 
        message: 'Validation failed',
        details: messages,
        errors: error.errors
      });
    }
    res.status(500).json({ message: 'Failed to send message', error: error.message });
  }
};

export const UpdateMessage = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const { text, image } = req.body;
    const userId = req.user._id;

    // Find the message
    const message = await Message.findById(messageId);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user is the sender of the message
    if (message.senderId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'You can only update your own messages' });
    }

    // Prepare update data
    const updateData = {};
    
    if (text !== undefined) {
      updateData.text = text;
    }

    if (image !== undefined || (req.files && req.files.length > 0)) {
      if (req.files && req.files.length > 0) {
        // new file uploaded
        const file = req.files[0];
        updateData.image = file.path || file.secure_url || file.url || null;

        // Delete old image if it exists
        if (message.image) {
          try {
            const publicId = message.image.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(`chat_messages/${publicId}`);
          } catch (cloudinaryError) {
            console.error('Error deleting old image:', cloudinaryError);
          }
        }
      } else if (image) {
        // If there's a new image, upload it
        const uploadResponse = await cloudinary.uploader.upload(image, {
          folder: 'chat_messages',
        });
        updateData.image = uploadResponse.secure_url;
        
        // Delete old image if it exists
        if (message.image) {
          try {
            const publicId = message.image.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(`chat_messages/${publicId}`);
          } catch (cloudinaryError) {
            console.error('Error deleting old image:', cloudinaryError);
          }
        }
      } else {
        // If image is null/empty, remove the image
        if (message.image) {
          try {
            const publicId = message.image.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(`chat_messages/${publicId}`);
          } catch (cloudinaryError) {
            console.error('Error deleting image:', cloudinaryError);
          }
        }
        updateData.image = null;
      }
    }

    // Update the message
    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      updateData,
      { new: true }
    );

    res.status(200).json({ 
      success: true, 
      data: updatedMessage,
      message: 'Message updated successfully' 
    });
    // Inform sockets about update
    try {
      if (global && global.io && global.onlineUsers) {
        const receiverSocketId = global.onlineUsers.get(updatedMessage.receiverId?.toString());
        if (receiverSocketId) global.io.to(receiverSocketId).emit('message_updated', updatedMessage);
        const senderSocketId = global.onlineUsers.get(updatedMessage.senderId?.toString());
        if (senderSocketId) global.io.to(senderSocketId).emit('message_updated', updatedMessage);
      }
    } catch (emitErr) {
      console.error('Socket emit error (update):', emitErr);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update message' });
  }
};

export const DeleteMessage = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const userId = req.user._id;

    // Find the message
    const message = await Message.findById(messageId);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user is the sender of the message
    if (message.senderId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'You can only delete your own messages' });
    }

    // Delete image from cloudinary if it exists
    if (message.image) {
      try {
        const publicId = message.image.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`chat_messages/${publicId}`);
      } catch (cloudinaryError) {
        console.error('Error deleting image from cloudinary:', cloudinaryError);
      }
    }

    // Delete the message
    await Message.findByIdAndDelete(messageId);

    res.status(200).json({ 
      success: true, 
      message: 'Message deleted successfully',
      deletedMessageId: messageId 
    });
    // Inform sockets about deletion
    try {
      if (global && global.io && global.onlineUsers) {
        const receiverSocketId = global.onlineUsers.get(message.receiverId?.toString());
        if (receiverSocketId) global.io.to(receiverSocketId).emit('message_deleted', { id: messageId });
        const senderSocketId = global.onlineUsers.get(message.senderId?.toString());
        if (senderSocketId) global.io.to(senderSocketId).emit('message_deleted', { id: messageId });
      }
    } catch (emitErr) {
      console.error('Socket emit error (delete):', emitErr);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete message' });
  }
};


