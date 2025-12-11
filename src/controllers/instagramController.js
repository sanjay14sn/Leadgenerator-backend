import InstagramLead from "../models/InstagramLead.js";
import { scrapeInstagramHashtag } from "../utils/instagramScraper.js";

/**
 * Retrieves all Instagram leads stored in the database.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
export async function getLeads(req, res) {
  try {
    // Fetches all leads from the dedicated Instagram collection
    const leads = await InstagramLead.find().lean();

    res.json({
      success: true,
      count: leads.length,
      data: leads,
    });
  } catch (err) {
    console.error("Error fetching Instagram leads:", err.message);
    res.status(500).json({ success: false, error: "Failed to retrieve leads." });
  }
}


/**
 * Initiates scraping for a given hashtag.
 * @param {object} req - Express request object (expects tag in params).
 * @param {object} res - Express response object.
 */
export async function scrapeHashtag(req, res) {
  try {
    // The tag comes from the URL parameter in the route definition
    const { tag } = req.params; 
    const limit = req.query.limit || 5; // Reduced limit for testing speed

    const scraped = await scrapeInstagramHashtag(tag, limit);

    for (let lead of scraped) {
      await InstagramLead.updateOne(
        { profileUrl: lead.profileUrl },  // Unique identifier
        { $set: lead },
        { upsert: true }
      );
    }

    res.json({
      success: true,
      message: "Scraping completed",
      count: scraped.length,
      data: scraped,
    });

  } catch (err) {
    console.error("Scraping error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
}