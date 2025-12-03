import express from "express";
import { search, searchSuggestions } from "../controllers/search.controller.js";

const router = express.Router();

/**
 * Recherche globale
 * GET /api/search?q=keyword&type=posts&limit=10&offset=0
 * Query Parameters:
 *   - q: required, search query (min 2 chars)
 *   - type: optional, filter by type (posts, users, events, challenges, projects)
 *   - limit: optional, results per page (max 50, default 10)
 *   - offset: optional, pagination offset (default 0)
 */
router.get("/", search);

/**
 * Suggestions / Autocomplete
 * GET /api/search/suggestions?q=keyword&limit=5
 * Returns quick results for autocomplete UI
 */
router.get("/suggestions", searchSuggestions);

export default router;
