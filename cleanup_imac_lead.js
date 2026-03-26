import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Lead from './src/models/Lead.js';

dotenv.config();

async function cleanup() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const res = await Lead.deleteMany({ phone: "+1 800 MLM IMAC" });
        console.log(`✅ Deleted ${res.deletedCount} leads with phone +1 800 MLM IMAC`);
        await mongoose.disconnect();
    } catch (err) {
        console.error("Error:", err);
    }
}

cleanup();
