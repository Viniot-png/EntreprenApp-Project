import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Project title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Project description is required"],
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to Entrepreneur/Startup
      required: true,
    },
    sector: {
      type: String,
      required: [true, "Sector is required"],
      trim: true,
    },
    stage: {
      type: String,
      enum: ["Idea", "Prototype", "Launched"],
      default: "Idea",
    },
    fundingGoal: {
      type: Number,
      required: [true, "Funding goal is required"],
      min: [0, "Funding goal cannot be negative"],
    },
    raisedAmount: {
      type: Number,
      default: 0,
      min: [0, "Raised amount cannot be negative"],
    },
    investors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Reference to Investors
      },
    ],
    status: {
      type: String,
      enum: ["Active", "Funded", "Closed"],
      default: "Active",
    },
  },
  {
    timestamps: true
  }
);

const Project = mongoose.model("Project", projectSchema);

export default Project;