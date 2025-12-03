import { v2 as cloudinary } from 'cloudinary';
import Event from "../models/event.model.js";
import User from "../models/user.model.js";
import { extractPublicId } from "../utils/mediaHelpers.js";
import { notifyNewEvent } from "../utils/notificationService.js";

// ============================================
// 📋 GET OPERATIONS
// ============================================

/**
 * Récupérer tous les événements
 */
export const GetAllEvents = async (req, res) => {
  try {
    const events = await Event.find({})
      .populate('organizer', 'fullname profileImage')
      .sort({ createdAt: -1 });

    if (!events || events.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        count: 0
      });
    }

    res.status(200).json({
      success: true,
      data: events,
      count: events.length
    });
  } catch (error) {
    console.error("Error fetching all events:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Récupérer un événement par ID
 */
export const getSingleEvent = async (req, res) => {
  const { id } = req.params;

  try {
    const event = await Event.findById(id)
      .populate('organizer', 'fullname email profileImage')
      .populate('registrations.user', 'fullname email profileImage');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error("Error fetching single event:", error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID format"
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtenir mes événements créés
 */
export const getMyEvents = async (req, res) => {
  try {
    const userId = req.user._id;

    const events = await Event.find({ organizer: userId })
      .populate('organizer', 'fullname email profileImage')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: events,
      count: events.length
    });
  } catch (error) {
    console.error("Error getting my events:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtenir mes inscriptions
 */
export const getMyRegistrations = async (req, res) => {
  try {
    const userId = req.user._id;

    const events = await Event.find({
      'registrations.user': userId
    })
      .populate('organizer', 'fullname email profileImage')
      .sort({ startDate: 1 });

    res.status(200).json({
      success: true,
      data: events,
      count: events.length
    });
  } catch (error) {
    console.error("Error getting my registrations:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtenir les inscriptions d'un événement (organisateur seulement)
 */
export const getEventRegistrations = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    // Vérifier que l'utilisateur est l'organisateur
    if (!event.organizer.equals(userId) && !['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view registrations"
      });
    }

    await event.populate('registrations.user', 'fullname email profileImage');

    res.status(200).json({
      success: true,
      data: event.registrations,
      count: event.registrations.length
    });
  } catch (error) {
    console.error("Error getting event registrations:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ============================================
// ➕ CREATE OPERATIONS
// ============================================

/**
 * Créer un événement avec image optionnelle
 */
export const createEvent = async (req, res) => {
  try {
    const { title, description, startDate, endDate, location, seats, price, isPaid, category, currency, paymentMethods } = req.body;
    const organizerId = req.user._id;

    // 1. Validations des champs requis
    const requiredFields = ['title', 'description', 'startDate', 'endDate', 'location'];
    const missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // 2. Valider la logique des dates
    if (new Date(endDate) <= new Date(startDate)) {
      return res.status(400).json({
        success: false,
        message: "End date must be after start date"
      });
    }

    // 3. Valider les places disponibles
    if (seats && (isNaN(seats) || seats < 0)) {
      return res.status(400).json({
        success: false,
        message: "Seats must be a positive number"
      });
    }

    // 4. Traiter l'image uploadée (une seule)
    let imageData = null;
    if (req.files && req.files.length > 0) {
      const file = req.files[0]; // Prendre seulement le premier fichier
      imageData = {
        url: file.secure_url || file.url || file.path, // Cloudinary retourne secure_url
        publicId: extractPublicId(file) // Extract public_id robustement
      };
    } else {
    }

    // 5. Parser les modes de paiement
    let paymentMethodsArray = [];
    if (paymentMethods) {
      paymentMethodsArray = Array.isArray(paymentMethods) 
        ? paymentMethods 
        : [paymentMethods];
    }

    // 5. Créer l'événement
    const event = new Event({
      title,
      description,
      startDate,
      endDate,
      location,
      seats: seats ? Number(seats) : null,
      price: price ? Number(price) : 0,
      isPaid: isPaid === 'true' || isPaid === true,
      currency: currency || 'EUR',
      paymentMethods: paymentMethodsArray.length > 0 ? paymentMethodsArray : ['bank_card'],
      category: category || 'Autre',
      image: imageData,
      organizer: organizerId,
      status: "Upcoming",
      registrations: [],
      participants: []
    });

    await event.save();
    
    await event.populate('organizer', 'fullname email profileImage');

    // 6. Notifier tous les utilisateurs
    try {
      const allUsers = await User.find({ _id: { $ne: organizerId } }).select('_id');
      const userIds = allUsers.map(u => u._id);
      if (userIds.length > 0) {
        await notifyNewEvent(organizerId, userIds, event._id, title);
      }
    } catch (notifErr) {
      console.error('Failed to send event notification:', notifErr);
      // Ne pas bloquer la création si la notification échoue
    }

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: event
    });

  } catch (error) {
    console.error("Error while creating event:", error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors).map(err => err.message).join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ============================================
// ✏️ UPDATE OPERATIONS
// ============================================

/**
 * Mettre à jour un événement
 */
export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, startDate, endDate, location, seats, price, isPaid, category, status } = req.body;
    const userId = req.user._id;

    // 1. Trouver l'événement
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    // 2. Vérifier l'autorisation
    const isOwner = event.organizer.equals(userId);
    const isAdmin = ['admin', 'super_admin'].includes(req.user.role);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this event"
      });
    }

    // 3. Mettre à jour les champs
    if (title) event.title = title;
    if (description) event.description = description;
    if (location) event.location = location;
    
    // Validation des dates
    if (startDate || endDate) {
      const newStart = new Date(startDate || event.startDate);
      const newEnd = new Date(endDate || event.endDate);
      
      if (newEnd <= newStart) {
        return res.status(400).json({
          success: false,
          message: "End date must be after start date"
        });
      }
      
      if (startDate) event.startDate = startDate;
      if (endDate) event.endDate = endDate;
    }

    if (seats !== undefined) event.seats = seats ? Number(seats) : null;
    if (price !== undefined) event.price = Number(price) || 0;
    if (isPaid !== undefined) event.isPaid = isPaid === 'true' || isPaid === true;
    if (category) event.category = category;
    if (status && ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'].includes(status)) {
      event.status = status;
    }

    // 4. Mettre à jour l'image si fournie
    if (req.files && req.files.length > 0) {
      // Supprimer l'ancienne image de Cloudinary
      if (event.image && event.image.publicId) {
        try {
          await cloudinary.uploader.destroy(event.image.publicId);
        } catch (delErr) {
          console.error('Error deleting old image:', delErr);
        }
      }
      
      // Uploader la nouvelle image (seulement le premier fichier)
      const file = req.files[0];
      event.image = {
        url: file.secure_url || file.url || file.path || null, // Cloudinary retourne secure_url
        publicId: extractPublicId(file) || null // Extract public_id robustement
      };
    }

    // 5. Mettre à jour les modes de paiement et la devise si fournis
    const { currency, paymentMethods } = req.body;
    if (currency) event.currency = currency;
    if (paymentMethods) {
      event.paymentMethods = Array.isArray(paymentMethods) 
        ? paymentMethods 
        : [paymentMethods];
    }

    await event.save();
    await event.populate('organizer', 'fullname email profileImage');

    res.status(200).json({
      success: true,
      message: "Event updated successfully",
      data: event
    });

  } catch (error) {
    console.error("Error updating event:", error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors).map(err => err.message).join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ============================================
// 🗑️ DELETE OPERATIONS
// ============================================

/**
 * Supprimer un événement
 */
export const deleteEvent = async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  const userRole = req.user.role;

  try {
    // 1. Trouver l'événement
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    // 2. Vérifier l'autorisation
    const isOwner = event.organizer.equals(userId);
    const isAdmin = ['admin', 'super_admin'].includes(userRole);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Only the event organizer or admins can delete this event"
      });
    }

    // 3. Supprimer l'image de Cloudinary si elle existe
    if (event.image && event.image.publicId) {
      try {
        await cloudinary.uploader.destroy(event.image.publicId);
      } catch (delErr) {
        console.error('Error deleting image from Cloudinary:', delErr);
      }
    }

    // 4. Supprimer l'événement
    await Event.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Event deleted successfully"
    });

  } catch (error) {
    console.error("Error while deleting event:", error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID format"
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ============================================
// 👥 REGISTRATION OPERATIONS
// ============================================

/**
 * S'inscrire à un événement
 */
export const registerToEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { paymentMethod } = req.body;

    // 1. Trouver l'événement
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    // 2. Vérifier si l'utilisateur est déjà inscrit
    const alreadyRegistered = event.registrations.find(reg => 
      reg.user && reg.user.equals(userId)
    );

    if (alreadyRegistered) {
      return res.status(400).json({
        success: false,
        message: "You are already registered for this event"
      });
    }

    // 3. Vérifier si l'événement est complet
    if (event.seats && event.registrations.length >= event.seats) {
      return res.status(400).json({
        success: false,
        message: "Event is at full capacity"
      });
    }

    // 4. Vérifier le statut de l'événement
    if (event.status === "Completed" || event.status === "Cancelled") {
      return res.status(400).json({
        success: false,
        message: "Registration is closed for this event"
      });
    }

    // 5. Ajouter l'inscription
    const user = req.user;
    event.registrations.push({
      user: userId,
      name: user.fullname,
      email: user.email,
      paymentMethod: paymentMethod || null,
      paid: !event.isPaid, // Si gratuit, automatiquement payé
      registeredAt: new Date()
    });

    // Ajouter aussi aux participants pour rétro-compatibilité
    if (!event.participants) {
      event.participants = [];
    }
    if (!event.participants.includes(userId)) {
      event.participants.push(userId);
    }

    await event.save();
    await event.populate('organizer', 'fullname email profileImage');

    res.status(200).json({
      success: true,
      message: "Successfully registered for the event",
      data: {
        eventId: event._id,
        registrationsCount: event.registrations.length,
        event
      }
    });

  } catch (error) {
    console.error("Error registering for event:", error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID format"
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Annuler l'inscription à un événement
 */
export const unregisterFromEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // 1. Trouver l'événement
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    // 2. Trouver et supprimer l'inscription
    const registrationIndex = event.registrations.findIndex(reg => 
      reg.user && reg.user.equals(userId)
    );

    if (registrationIndex === -1) {
      return res.status(400).json({
        success: false,
        message: "You are not registered for this event"
      });
    }

    event.registrations.splice(registrationIndex, 1);

    // Supprimer aussi des participants
    const participantIndex = event.participants.indexOf(userId);
    if (participantIndex !== -1) {
      event.participants.splice(participantIndex, 1);
    }

    await event.save();
    await event.populate('organizer', 'fullname email profileImage');

    res.status(200).json({
      success: true,
      message: "Successfully unregistered from the event",
      data: {
        eventId: event._id,
        registrationsCount: event.registrations.length,
        event
      }
    });

  } catch (error) {
    console.error("Error unregistering from event:", error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID format"
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};