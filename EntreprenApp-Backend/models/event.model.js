import mongoose from "mongoose";

const eventRegistrationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: String,
  email: String,
  paymentMethod: { 
    type: String,
    enum: ['mobile_money', 'bank_card', 'transfer'],
    default: 'bank_card'
  },
  paid: { type: Boolean, default: false },
  amount: Number,
  registeredAt: { type: Date, default: Date.now }
});

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  organizer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  image: {
    url: String,
    publicId: String
  },
  registrations: [eventRegistrationSchema],
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  seats: { type: Number },
  isPaid: { type: Boolean, default: false },
  price: { type: Number, default: 0 },
  currency: { 
    type: String, 
    enum: ['USD', 'EUR', 'XOF'],
    default: 'EUR' 
  },
  paymentMethods: [
    {
      type: String,
      enum: ['mobile_money', 'bank_card'],
      default: 'bank_card'
    }
  ],
  startDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ["Upcoming", "Ongoing", "Completed"],
    default: "Upcoming"
  },
  endDate: { 
    type: Date,
    required: true,
    validate: {
      validator: function(value) {
        return value > this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  location: { type: String, required: true },
  category: { type: String, default: 'Autre' }
}, {
  timestamps: true
});

// Virtual pour obtenir le nombre de participants
eventSchema.virtual('participantCount').get(function() {
  return this.registrations.length;
});

const Event = mongoose.model("Event", eventSchema);

export default Event;