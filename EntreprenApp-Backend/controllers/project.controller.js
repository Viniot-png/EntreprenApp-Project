import Project from '../models/project.model.js'



// Create a new project
export const createProject = async (req, res) => {
  const { title, description, sector, stage, fundingGoal } = req.body;
  const creator = req.user._id;

  try {
    // Validate required fields
    if (!title || !description || !sector || !fundingGoal) {
      return res.status(400).json({
        success: false,
        message: "Title, description, sector, and funding goal are required"
      });
    }

    // Create project
    const project = new Project({
      title,
      description,
      creator,
      sector,
      stage: stage || "Idea",
      fundingGoal,
      status: "Active"
    });

    await project.save();

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: project
    });

  } catch (error) {
    console.error("Error creating project:", error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors).map(err => err.message).join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get all projects
export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate('creator', 'fullname email')
      .populate('investors', 'fullname email');
    
    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get single project
export const getProject = async (req, res) => {
    const {id} = req.params;
  try {
    const project = await Project.findById(id)
      .populate('creator', 'fullname email')
      .populate('investors', 'fullname email');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error("Error fetching project:", error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID"
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Update project
export const updateProject = async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  const updates = req.body;

  try {
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    // Authorization: Only creator or admin /super_admin can update
    if (!project.creator.equals(userId) && req.user.role !== 'admin' && req.user.role !== 'super_admin' ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this project"
      });
    }

    // Prevent updating certain fields
    const allowedUpdates = ['title', 'description', 'sector', 'stage', 'status'];
    const isValidUpdate = Object.keys(updates).every(field => allowedUpdates.includes(field));

    if (!isValidUpdate) {
      return res.status(400).json({
        success: false,
        message: "Invalid updates! Only title, description, sector, stage, and status can be modified"
      });
    }

    const updatedProject = await Project.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: updatedProject
    });

  } catch (error) {
    console.error("Error updating project:", error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors).map(err => err.message).join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Delete project
export const deleteProject = async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  try {
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    // Authorization: Only creator or admin/super_admin can delete
    if (!project.creator.equals(userId) && req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this project"
      });
    }

    await Project.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Project deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting project:", error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID"
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};


// Invest in project
export const investInProject = async (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;
  const investorId = req.user._id;

  try {
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid investment amount is required"
      });
    }

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    // Check if already invested
    if (project.investors.includes(investorId)) {
      return res.status(400).json({
        success: false,
        message: "You have already invested in this project"
      });
    }

    // Update project
    project.investors.push(investorId);
    project.raisedAmount += amount;

    // Check if funding goal is reached
    if (project.raisedAmount >= project.fundingGoal) {
      project.status = "Funded";
    }

    await project.save();

    res.status(200).json({
      success: true,
      message: "Investment successful",
      data: {
        projectId: project._id,
        raisedAmount: project.raisedAmount,
        fundingGoal: project.fundingGoal,
        status: project.status
      }
    });

  } catch (error) {
    console.error("Error investing in project:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};