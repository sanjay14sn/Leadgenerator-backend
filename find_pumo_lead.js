import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Lead from './src/models/Lead.js';

dotenv.config();

async function findLead() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const lead = await Lead.findOne({ phone: "096006 00263" });

        if (lead) {
            console.log("✅ Lead found:", lead.name);
            console.log("🆔 Lead ID:", lead._id);
            console.log("🌐 Preview URL: http://localhost:5024/api/ai/preview/" + lead._id);
        } else {
            console.log("❌ Lead not found.");
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error("Error:", err);
    }
}

findLead();
