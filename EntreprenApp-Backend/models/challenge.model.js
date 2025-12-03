import mongoose from "mongoose";

const challengeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    organisation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to User (Organisation/University)
      required: true,
    },
    sector: {
      type: String,
      required: true,
    },
    deadline: {
      type: Date,
      required: true,
    },
    fundingAmount: {
      type: Number,
      required: true,
    },
    applicants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // References to Users (Entrepreneurs/Startups)
      },
    ],
    selectedApplicants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // References to selected Users
      },
    ],
  },
  {
    timestamps: true
  }
);

const Challenge = mongoose.model("Challenge", challengeSchema );

export default Challenge;