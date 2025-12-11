import mongoose from "mongoose";

const leadSchema = new mongoose.Schema({
  name: String,
  phone: String,
  address: String,
  website: String,
  hasWebsite: Boolean,

  category: String,
  tags: [String],

  rating: Number,
  reviews: Number,
  rating_breakdown: Object,
  review_snippet: String,

  gmap_link: String,
  lat: Number,
  lng: Number,

  images: [String],            // only plain image URLs here
  thumbnail: String,
  static_map: String,

  description: String,
  hours: [String],
  open_now_text: String,

  whatsapp: Boolean,
  jd_whatsapp_exists: Boolean,
  jd_whatsapp_number: String,

  lead_score: Number,
  keyword: String,

  verified: Boolean,

  instagram_exact: { type: String, default: "" },
  instagram_suggestions: { type: [String], default: [] },

  /* --- NEW WEBSITE FIELDS --- */
  web_url: { type: String, default: "" },
  template_used: { type: String, default: "template1" },
  last_published: { type: Date },
  subdomain: { type: String, default: "" },
  published_template: { type: String, default: "" },

  /* store any AI / generated image objects separately */
  generated_images: { type: [mongoose.Schema.Types.Mixed], default: [] },

  createdAt: { type: Date, default: Date.now },
});

leadSchema.index({ phone: 1 }, { unique: true, sparse: true });

export default mongoose.model("Lead", leadSchema);
