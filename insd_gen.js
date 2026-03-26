import fetch from 'node-fetch';

const PORT = 5024;
const BASE_URL = `http://localhost:${PORT}/api/ai`;

const leadData = {
    name: "INSD Coimbatore",
    category: "Design Institute",
    description: "A premier design institute dedicated to fashion, interior, graphic, and animation design. Located in Coimbatore, Tamil Nadu. Where Creativity Meets Opportunity.",
    phone: "+91 96006 00263",
    address: "INSD Coimbatore, Indian Bank Building, Sathy Rd, Ramanandha Nagar, Saravanampatti, Coimbatore, Tamil Nadu 641035, India",
    user: "64ed7b000000000000000000" // Dummy ObjectId
};

const run = async () => {
    // 1. Cleanup
    console.log("🧹 Cleaning up old leads...");
    await fetch(`http://localhost:5024/api/leads`, { method: 'DELETE' }); // Custom assume or just run it

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
    console.log("\n🚀 Step 2: Generating site code with MANDATORY FEATURES...");
    const genRes = await fetch(`${BASE_URL}/generate-site-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            lead: {
                ...leadData,
                hero_title: enhanced.hero_title,
                hero_subtitle: enhanced.hero_subtitle,
                description: enhanced.description,
                cta_title: enhanced.cta_title,
                cta_button: enhanced.cta_button,
                testimonials: enhanced.testimonials,
                images: enhanced.images,
                generated_images: enhanced.generated_images
            },
            instructions: "Create a world-class design institute landing page. MUST HAVE: Sticky Navbar, Dark/Light Mode toggle, Contact Form, Testimonials, and Google Maps. Use a sophisticated, modern, artistic aesthetic. Clean grid layouts for courses and masterpieces."
        })
    });

    const genData = await genRes.json();
    if (genData.error) {
        console.error("❌ Site generation failed:", genData.error, genData.message);
        return;
    }

    console.log("\n✅ INSD Site generated successfully!");
    console.log("🆔 Lead ID:", genData.leadId);
    console.log("🌐 Preview URL:", genData.previewUrl);
};

run();
