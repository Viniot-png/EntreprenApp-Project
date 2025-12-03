import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, 'Sender ID is required']
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, 'Receiver ID is required']
  },
  text: {
    type: String,
    default: '',
    trim: true
  },
  read: {
    type: Boolean,
    default: false,
  },
  image: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

const Message = mongoose.model("Message", MessageSchema);
export default Message;