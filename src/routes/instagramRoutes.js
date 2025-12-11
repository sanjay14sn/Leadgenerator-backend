import express from 'express';
// Ensure the paths are correct based on your project structure
import { scrapeHashtag, getLeads } from '../controllers/instagramController.js'; 

const router = express.Router();

// GET /api/instagram/leads - Retrieves all scraped data
router.get('/leads', getLeads); 

// POST /api/instagram/scrape/:tag - Triggers the scraping process
router.post('/scrape/:tag', scrapeHashtag);

export default router;

// NOTE: You must also ensure this router is integrated into your main Express app (server.js), e.g.:
// app.use('/api/instagram', instagramRoutes);