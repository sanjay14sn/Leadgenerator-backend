import fetch from 'node-fetch';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Lead from './src/models/Lead.js';

dotenv.config();

const PORT = 5024;
const BASE_URL = `http://localhost:${PORT}/api/ai`;

const leadData = {
    name: "Iqtechway",
    category: "Digital Agency",
    description: "Iqtechway is a leading digital agency specializing in modern, premium website design and development of visually stunning, user-friendly, and highly functional websites that drive significant business growth.",
    phone: "075388 57567",
    address: "204 A, A.K.G. COMPLEX, New Siddhapudur, Tamil Nadu 641044, India",
    user: "64ed7b000000000000000000" // Dummy ObjectId
};

const run = async () => {
    // 1. Cleanup old leads with same phone
    console.log("🧹 Cleaning up old Iqtechway leads...");
    await mongoose.connect(process.env.MONGO_URI);
    const delRes = await Lead.deleteMany({ phone: "075388 57567" });
    console.log(`✅ Deleted ${delRes.deletedCount} leads.`);
    await mongoose.disconnect();

    // 2. Enhance
    console.log("🚀 Step 1: Enhancing content...");
    const enhanceRes = await fetch(`${BASE_URL}/enhance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead: leadData })
    });

    const enhanceData = await enhanceRes.json();
    if (enhanceData.error) {
        console.error("❌ Enhancement failed:", enhanceData.error);
        return;
    }

    const enhanced = enhanceData.enhanced;
    console.log("✅ Content enhanced!");

    // 3. Generate
    console.log("\n🚀 Step 2: Generating site code with ULTIMATE MOBILE-FIRST DESIGN...");
    const genRes = await fetch(`${BASE_URL}/generate-site-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            lead: {
                ...leadData,
                hero_title: "Premium Website Design That Drives Conversions",
                hero_subtitle: "Transform your online presence with Iqtechway. We craft stunning, high-performing websites tailored to your business needs.",
                description: enhanced.description,
                cta_title: enhanced.cta_title,
                cta_button: enhanced.cta_button,
                testimonials: enhanced.testimonials,
                images: enhanced.images,
                generated_images: enhanced.generated_images
            },
            instructions: "Create a world-class digital agency site. MUST BE PERFECTLY RESPONSIVE (Mobile First). Fixed Navbar with Right-aligned Hamburger Menu. Visible floating WhatsApp/Call FAB. Professional aesthetic using deep blues and whites. High-contrast theme toggle."
        })
    });

    const genData = await genRes.json();
    if (genData.error) {
        console.error("❌ Site generation failed:", genData.error, genData.message);
        return;
    }

    console.log("\n✅ Iqtechway Site generated successfully!");
    console.log("🆔 Lead ID:", genData.leadId);
    console.log("🌐 Preview URL:", genData.previewUrl);
};

run();
