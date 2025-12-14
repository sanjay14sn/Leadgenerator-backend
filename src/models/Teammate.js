import mongoose from "mongoose";

const TeammateSchema = new mongoose.Schema(
  {
    // BASIC INFO
    name: String,
    email: { type: String, unique: true },
    phone: String,

    role: {
      type: String,
      enum: ["AGENT", "MANAGER"],
      default: "AGENT",
    },

    // TARGET & GUIDANCE
    monthly_target: Number,
    instructions: String,

    // LOGIN CREDENTIALS (for mobile app)
    credentials: {
      username: String,
      password: String, // hashed
    },

    // PERFORMANCE (AUTO UPDATED)
    performance: {
      leads_assigned: { type: Number, default: 0 },
      leads_contacted: { type: Number, default: 0 },
      leads_interested: { type: Number, default: 0 },
      leads_closed: { type: Number, default: 0 },
      conversion_rate: { type: Number, default: 0 },
    },

    // PERMISSIONS
    permissions: {
      can_call: { type: Boolean, default: true },
      can_whatsapp: { type: Boolean, default: true },
      can_add_note: { type: Boolean, default: true },
      can_change_status: { type: Boolean, default: true },
      can_export: { type: Boolean, default: false },
    },

    // WORKING DETAILS
    languages: [String],
    regions: [String],
    working_hours: {
      from: String,
      to: String,
    },
    weekly_off: [String],

    // ACTIVITY TRACKING
    last_active_at: Date,
    last_action: String,

    login_history: [
      {
        at: Date,
        ip: String,
        device: String,
      },
    ],

    // PAY STRUCTURE
    salary: {
      base: Number,
      commission_per_lead: Number,
      commission_per_close: Number,
    },

    admin_notes: String,

    isActive: { type: Boolean, default: true },

    // ADMIN OWNER
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Teammate", TeammateSchema);
