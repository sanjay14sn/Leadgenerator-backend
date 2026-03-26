import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        name: { type: String, required: true },
        status: {
            type: String,
            enum: ["idle", "running", "paused", "completed"],
            default: "idle",
        },
        total_leads: { type: Number, default: 0 },
        processed_count: { type: Number, default: 0 },
        success_count: { type: Number, default: 0 },
        error_count: { type: Number, default: 0 },
        createdAt: { type: Date, default: Date.now },
    },
    { versionKey: false }
);

export default mongoose.model("Campaign", campaignSchema);
