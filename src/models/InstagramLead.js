import mongoose from "mongoose";

const InstagramLeadSchema = new mongoose.Schema({
  profileUrl: { type: String, required: true, unique: true },
  name: String,
  bio: String,
  website: String,
  phone: String,          // extracted WhatsApp number
  hashtag: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("InstagramLead", InstagramLeadSchema);
