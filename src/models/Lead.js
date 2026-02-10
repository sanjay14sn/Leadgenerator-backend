import mongoose from "mongoose";

/* ----------------------------------------------------
   FOLLOW-UP HISTORY
---------------------------------------------------- */
const followupHistorySchema = new mongoose.Schema({
  action: { type: String, required: true }, // e.g., "WHATSAPP_SENT"
  message: { type: String, default: "" },
  timestamp: { type: Date, default: Date.now },
});

/* ----------------------------------------------------
   FOLLOW-UP SCHEMA
---------------------------------------------------- */
const followupSchema = new mongoose.Schema({
  whatsapp_sent_count: { type: Number, default: 0 },
  last_whatsapp_sent: { type: Date, default: null },

  // Cron-based auto-reminders
  day1_done: { type: Boolean, default: false },
  day3_done: { type: Boolean, default: false },
  day7_done: { type: Boolean, default: false },

  status: {
    type: String,
    enum: [
      "PENDING",
      "SEEN",
      "INTERESTED",
      "NOT_INTERESTED",
      "NOT_REACHABLE",
      "CLOSED",
      "HAS_WEBSITE_ALREADY",
      "COMPLETED",
    ],
    default: "PENDING",
  },

  history: { type: [followupHistorySchema], default: [] },
});

/* ----------------------------------------------------
   MAIN LEAD SCHEMA
---------------------------------------------------- */
const leadSchema = new mongoose.Schema(
  {
    /* ----------------------------------------------------
       ⭐ USER — Multi-Tenant Owner
    ---------------------------------------------------- */
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    /* ----------------------------------------------------
       BASIC INFO
    ---------------------------------------------------- */
    name: { type: String, default: "" },
    phone: { type: String, required: true },
    address: { type: String, default: "" },

    website: { type: String, default: "" },
    hasWebsite: { type: Boolean, default: false },

    /* ----------------------------------------------------
       CATEGORY INFO
    ---------------------------------------------------- */
    category: { type: String, default: "" },
    tags: { type: [String], default: [] },

    /* ----------------------------------------------------
       GOOGLE BUSINESS FIELDS
    ---------------------------------------------------- */
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    rating_breakdown: { type: Object, default: {} },
    review_snippet: { type: String, default: "" },

    gmap_link: { type: String, default: "" },
    lat: Number,
    lng: Number,

    images: { type: Array, default: [] },
    generated_images: { type: Array, default: [] },
    thumbnail: { type: String, default: "" },
    static_map: { type: String, default: "" },

    description: { type: String, default: "" },
    hours: { type: [String], default: [] },
    open_now_text: { type: String, default: "" },

    /* ----------------------------------------------------
       WHATSAPP DETECTION
    ---------------------------------------------------- */
    whatsapp: { type: Boolean, default: false },
    jd_whatsapp_exists: { type: Boolean, default: false },
    jd_whatsapp_number: { type: String, default: "" },

    /* ----------------------------------------------------
       INSTAGRAM MATCHING
    ---------------------------------------------------- */
    instagram_exact: { type: String, default: "" },
    instagram_suggestions: { type: [String], default: [] },

    /* ----------------------------------------------------
       LEAD SCORE
    ---------------------------------------------------- */
    lead_score: { type: Number, default: 0 },

    /* ----------------------------------------------------
       WEBSITE BUILDER FIELDS
    ---------------------------------------------------- */
    hero_title: { type: String, default: "" },
    hero_subtitle: { type: String, default: "" },
    cta_title: { type: String, default: "" },
    cta_button: { type: String, default: "" },
    testimonials: { type: Array, default: [] },
    poster_url: { type: String, default: "" },

    web_url: { type: String, default: "" },
    last_published: { type: Date, default: null },

    /* ----------------------------------------------------
       FOLLOW-UP SYSTEM
    ---------------------------------------------------- */
    followup: { type: followupSchema, default: () => ({}) },

    /* ----------------------------------------------------
   LEAD ASSIGNMENT + SCHEDULING (PATCH)
---------------------------------------------------- */
    assigned_to_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teammate",
      default: null,
    },
    assigned_to_name: { type: String, default: "" },
    assigned_at: { type: Date, default: null },
    locked: { type: Boolean, default: false },

    next_followup_date: { type: Date, default: null },
    next_followup_note: { type: String, default: "" },

    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

/* ----------------------------------------------------
   ⭐ UNIQUE INDEX PER USER
---------------------------------------------------- */
// This prevents conflicts between different users.
leadSchema.index({ phone: 1, user: 1 }, { unique: true, sparse: true });

export default mongoose.model("Lead", leadSchema);
