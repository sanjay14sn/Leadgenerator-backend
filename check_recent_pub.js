import mongoose from "mongoose";
import dotenv from "dotenv";
import Lead from "./src/models/Lead.js";

dotenv.config();

async function checkRecentPub() {
    await mongoose.connect(process.env.MONGO_URI);
    const publishedLead = await Lead.findOne({ web_url: { $exists: true, $ne: "" } }).sort({ updatedAt: -1 });
    if (publishedLead) {
        console.log("🚀 Recently Published Lead:");
        console.log("Name:", publishedLead.name);
        console.log("Web URL:", publishedLead.web_url);
        console.log("Subdomain Key (inferred):", publishedLead.web_url.replace("https://", "").replace(".iqsync.in", ""));
    } else {
        console.log("❌ No published leads found.");
    }
    process.exit(0);
}

checkRecentPub();
