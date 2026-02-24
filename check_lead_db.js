
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Lead from './src/models/Lead.js';

dotenv.config();

async function checkLead() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        const lead = await Lead.findOne({ name: { $regex: "Chill Spray", $options: "i" } });

        if (!lead) {
            console.log("❌ Lead 'Chill Spray' not found.");
        } else {
            console.log("✅ Lead found:", lead.name);
            console.log("HTML Code Length:", lead.generated_html_code ? lead.generated_html_code.length : 0);
            console.log("CSS Code Length:", lead.generated_css_code ? lead.generated_css_code.length : 0);

            if (lead.generated_html_code) {
                console.log("Preview HTML:", lead.generated_html_code.substring(0, 100));
            }
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error("Error:", err);
    }
}

checkLead();
