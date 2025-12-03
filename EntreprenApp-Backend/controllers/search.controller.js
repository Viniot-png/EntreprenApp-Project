import Challenge from "../models/challenge.model.js";
import Event from "../models/event.model.js";
import Post from "../models/post.model.js";
import Project from "../models/project.model.js";
import User from "../models/user.model.js";

/**
 * Rechercher dans toute l'application
 * Supports: posts, users, events, challenges, projects
 */
export const search = async (req, res) => {
  try {
    const { q, type, limit = 10, offset = 0 } = req.query;
    const searchQuery = String(q || '').trim();

    // Validation
    if (!searchQuery || searchQuery.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Query must be at least 2 characters long"
      });
    }

    if (searchQuery.length > 200) {
      return res.status(400).json({
        success: false,
        message: "Query must be less than 200 characters"
      });
    }

    const skip = Math.max(0, parseInt(offset) || 0);
    const take = Math.min(50, Math.max(1, parseInt(limit) || 10));

    // Créer un regex pour la recherche insensible à la casse
    const regex = new RegExp(searchQuery, 'i');

    const results = {
      success: true,
      query: searchQuery,
      results: {
        posts: [],
        users: [],
        events: [],
        challenges: [],
        projects: []
      },
      count: {
        posts: 0,
        users: 0,
        events: 0,
        challenges: 0,
        projects: 0
      },
      total: 0
    };

    // Rechercher par type ou tous les types
    const types = type ? [type.toLowerCase()] : ['posts', 'users', 'events', 'challenges', 'projects'];

    // ============================================
    // RECHERCHE POSTS
    // ============================================
    if (types.includes('posts')) {
      try {
        const posts = await Post.find({
          $or: [
            { title: regex },
            { content: regex },
            { description: regex }
          ],
          visibility: { $in: ['public', 'connections'] } // N'afficher que les posts publics/connexions
        })
          .populate('author', 'fullname username profileImage')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(take);

        results.results.posts = posts;
        
        // Compter le total
        const totalPosts = await Post.countDocuments({
          $or: [
            { title: regex },
            { content: regex },
            { description: regex }
          ],
          visibility: { $in: ['public', 'connections'] }
        });
        results.count.posts = totalPosts;
      } catch (err) {
        console.error('Error searching posts:', err);
      }
    }

    // ============================================
    // RECHERCHE USERS
    // ============================================
    if (types.includes('users')) {
      try {
        const users = await User.find({
          $or: [
            { fullname: regex },
            { username: regex },
            { bio: regex }
          ]
        })
          .select('fullname username email profileImage role bio expertise')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(take);

        results.results.users = users;

        const totalUsers = await User.countDocuments({
          $or: [
            { fullname: regex },
            { username: regex },
            { bio: regex }
          ]
        });
        results.count.users = totalUsers;
      } catch (err) {
        console.error('Error searching users:', err);
      }
    }

    // ============================================
    // RECHERCHE EVENTS
    // ============================================
    if (types.includes('events')) {
      try {
        const events = await Event.find({
          $or: [
            { title: regex },
            { description: regex },
            { location: regex },
            { category: regex }
          ],
          status: { $in: ['Upcoming', 'Ongoing'] } // Seulement les événements actifs
        })
          .populate('organizer', 'fullname username profileImage')
          .sort({ startDate: 1 })
          .skip(skip)
          .limit(take);

        results.results.events = events;

        const totalEvents = await Event.countDocuments({
          $or: [
            { title: regex },
            { description: regex },
            { location: regex },
            { category: regex }
          ],
          status: { $in: ['Upcoming', 'Ongoing'] }
        });
        results.count.events = totalEvents;
      } catch (err) {
        console.error('Error searching events:', err);
      }
    }

    // ============================================
    // RECHERCHE CHALLENGES
    // ============================================
    if (types.includes('challenges')) {
      try {
        const challenges = await Challenge.find({
          $or: [
            { title: regex },
            { description: regex },
            { category: regex }
          ],
          status: { $in: ['Active', 'Open'] }
        })
          .populate('creator', 'fullname username profileImage')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(take);

        results.results.challenges = challenges;

        const totalChallenges = await Challenge.countDocuments({
          $or: [
            { title: regex },
            { description: regex },
            { category: regex }
          ],
          status: { $in: ['Active', 'Open'] }
        });
        results.count.challenges = totalChallenges;
      } catch (err) {
        console.error('Error searching challenges:', err);
      }
    }

    // ============================================
    // RECHERCHE PROJECTS
    // ============================================
    if (types.includes('projects')) {
      try {
        const projects = await Project.find({
          $or: [
            { title: regex },
            { description: regex },
            { category: regex }
          ],
          status: { $in: ['Active', 'In Progress', 'Open'] }
        })
          .populate('creator', 'fullname username profileImage')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(take);

        results.results.projects = projects;

        const totalProjects = await Project.countDocuments({
          $or: [
            { title: regex },
            { description: regex },
            { category: regex }
          ],
          status: { $in: ['Active', 'In Progress', 'Open'] }
        });
        results.count.projects = totalProjects;
      } catch (err) {
        console.error('Error searching projects:', err);
      }
    }

    // Calculer le total global
    results.total = Object.values(results.count).reduce((a, b) => a + b, 0);

    res.status(200).json(results);

  } catch (error) {
    console.error("Error searching:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Recherche rapide (suggestions)
 * Retourne les résultats pour l'autocomplete
 */
export const searchSuggestions = async (req, res) => {
  try {
    const { q, limit = 5 } = req.query;
    const searchQuery = String(q || '').trim();

    if (!searchQuery || searchQuery.length < 2) {
      return res.status(200).json({
        success: true,
        suggestions: {
          users: [],
          posts: [],
          events: []
        }
      });
    }

    const take = Math.min(10, Math.max(1, parseInt(limit) || 5));
    const regex = new RegExp(searchQuery, 'i');

    // Recherche parallèle
    const [users, posts, events] = await Promise.all([
      User.find(
        { $or: [{ fullname: regex }, { username: regex }] },
        { fullname: 1, username: 1, profileImage: 1 }
      ).limit(take),
      Post.find(
        { 
          $or: [{ title: regex }, { content: regex }],
          visibility: { $in: ['public', 'connections'] }
        },
        { title: 1, content: 1, author: 1 }
      ).populate('author', 'fullname').limit(take),
      Event.find(
        { 
          $or: [{ title: regex }, { description: regex }],
          status: 'Upcoming'
        },
        { title: 1, description: 1, startDate: 1 }
      ).limit(take)
    ]);

    res.status(200).json({
      success: true,
      suggestions: {
        users,
        posts,
        events
      }
    });

  } catch (error) {
    console.error("Error in search suggestions:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
