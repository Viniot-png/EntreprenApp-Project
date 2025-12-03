import Challenge from "../models/challenge.model.js";
import User from "../models/user.model.js";

// Create a new challenge
export const createChallenge = async (req, res) => {
  const { title, description, sector, deadline, fundingAmount } = req.body;
  const organisation = req.user._id;

  try {
    // Validate required fields
    if (!title || !description || !sector || !deadline || !fundingAmount) {
      return res.status(400).json({
        success: false,
        message: "Tous les champs (titre, description, secteur, date limite, montant) sont obligatoires"
      });
    }

    // Validate deadline is in the future
    if (new Date(deadline) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "La date limite doit être dans le futur"
      });
    }

    // Validate funding amount
    if (fundingAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Le montant de financement doit être positif"
      });
    }

    // Create challenge
    const challenge = new Challenge({
      title,
      description,
      organisation,
      sector,
      deadline,
      fundingAmount
    });

    await challenge.save();

    res.status(201).json({
      success: true,
      message: "Défi créé avec succès",
      data: challenge
    });

  } catch (error) {
    console.error("Error creating challenge:", error);
    
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

// Get all challenges
export const getChallenges = async (req, res) => {
  try {
    const challenges = await Challenge.find()
      .populate('organisation', 'fullname email')
      .populate('applicants', 'fullname email')
      .populate('selectedApplicants', 'fullname email');
    
    res.status(200).json({
      success: true,
      count: challenges.length,
      data: challenges
    });
  } catch (error) {
    console.error("Error fetching challenges:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get single challenge
export const getChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id)
      .populate('organisation', 'fullname email')
      .populate('applicants', 'fullname email')
      .populate('selectedApplicants', 'fullname email');

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: "Défi non trouvé"
      });
    }

    res.status(200).json({
      success: true,
      data: challenge
    });
  } catch (error) {
    console.error("Error fetching challenge:", error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "ID de défi invalide"
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Update challenge (organisation only)
export const updateChallenge = async (req, res) => {
  const { id } = req.params;
  const organisationId = req.user._id;
  const updates = req.body;

  try {
    const challenge = await Challenge.findById(id);

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: "Défi non trouvé"
      });
    }

    // Authorization: Only organisation can update
    if (!challenge.organisation.equals(organisationId)) {
      return res.status(403).json({
        success: false,
        message: "Vous n'êtes pas autorisé à modifier ce défi"
      });
    }

    // Prevent updating certain fields after deadline
    if (new Date() > challenge.deadline) {
      return res.status(400).json({
        success: false,
        message: "Le défi ne peut pas être modifié après la date limite"
      });
    }

    // Allowed updates
    const allowedUpdates = ['title', 'description', 'sector', 'deadline', 'fundingAmount'];
    const isValidUpdate = Object.keys(updates).every(field => allowedUpdates.includes(field));

    if (!isValidUpdate) {
      return res.status(400).json({
        success: false,
        message: "Mises à jour invalides ! Seuls le titre, la description, le secteur, la date limite et le montant peuvent être modifiés"
      });
    }

    // Validate new deadline if being updated
    if (updates.deadline && new Date(updates.deadline) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "La nouvelle date limite doit être dans le futur"
      });
    }

    const updatedChallenge = await Challenge.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: "Défi mis à jour avec succès",
      data: updatedChallenge
    });

  } catch (error) {
    console.error("Error updating challenge:", error);
    
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

// Delete challenge (organisation only)
export const deleteChallenge = async (req, res) => {
  const { id } = req.params;
  const organisationId = req.user._id;

  try {
    const challenge = await Challenge.findById(id);

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: "Défi non trouvé"
      });
    }

    // Authorization: Only organisation can delete
    if (!challenge.organisation.equals(organisationId)) {
      return res.status(403).json({
        success: false,
        message: "Vous n'êtes pas autorisé à supprimer ce défi"
      });
    }

    await challenge.remove();

    res.status(200).json({
      success: true,
      message: "Défi supprimé avec succès"
    });

  } catch (error) {
    console.error("Error deleting challenge:", error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "ID de défi invalide"
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Apply to challenge
export const applyToChallenge = async (req, res) => {
  const {id} = req.params;
  const applicantId = req.user._id;

  try {
    const challenge = await Challenge.findById(id);
    const applicant = await User.findById(applicantId);

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: "Défi non trouvé"
      });
    }

    if (!applicant) {
      return res.status(404).json({
        success: false,
        message: "Candidat non trouvé"
      });
    }

    // Check if challenge deadline has passed
    if (new Date() > challenge.deadline) {
      return res.status(400).json({
        success: false,
        message: "La date limite de candidature a dépassé"
      });
    }

    // Check if already applied
    if (challenge.applicants.includes(applicantId)) {
      return res.status(400).json({
        success: false,
        message: "Vous avez déjà postulé pour ce défi"
      });
    }

    // Add applicant
    challenge.applicants.push(applicantId);
    await challenge.save();


    res.status(200).json({
      success: true,
      message: "Candidature soumise avec succès",
      data: {
        challengeId: challenge._id,
        applicantsCount: challenge.applicants.length
      }
    });

  } catch (error) {
    console.error("Error applying to challenge:", error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "Invalid challenge ID"
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Select applicant (organisation only)
export const selectApplicant = async (req, res) => {
  const { challengeId, applicantId } = req.params;
  const organisationId = req.user._id;

  try {
    const challenge = await Challenge.findById(challengeId);

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: "Défi non trouvé"
      });
    }

    // Authorization: Only organisation can select
    if (!challenge.organisation.equals(organisationId)) {
      return res.status(403).json({
        success: false,
        message: "Vous n'êtes pas autorisé à sélectionner les candidats pour ce défi"
      });
    }

    // Check if applicant exists
    const applicant = await User.findById(applicantId);
    if (!applicant) {
      return res.status(404).json({
        success: false,
        message: "Candidat non trouvé"
      });
    }

    // Check if applicant actually applied
    if (!challenge.applicants.includes(applicantId)) {
      return res.status(400).json({
        success: false,
        message: "Cet utilisateur n'a pas postulé pour le défi"
      });
    }

    // Check if already selected
    if (challenge.selectedApplicants.includes(applicantId)) {
      return res.status(400).json({
        success: false,
        message: "Le candidat est déjà sélectionné"
      });
    }

    // Select applicant
    challenge.selectedApplicants.push(applicantId);
    await challenge.save();

    // Add to user's achievements (optional)
    applicant.achievements.push({
      type: "challenge",
      challenge: challengeId,
      status: "selected",
      reward: challenge.fundingAmount
    });
    await applicant.save();

    res.status(200).json({
      success: true,
      message: "Candidat sélectionné avec succès",
      data: {
        challengeId: challenge._id,
        selectedCount: challenge.selectedApplicants.length,
        applicant: {
          id: applicant._id,
          name: applicant.name,
          email: applicant.email
        }
      }
    });

  } catch (error) {
    console.error("Error selecting applicant:", error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format"
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};