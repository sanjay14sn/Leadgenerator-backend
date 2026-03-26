import fetch from 'node-fetch';

const PORT = 5024;
const BASE_URL = `http://localhost:${PORT}/api/ai`;

const leadData = {
    name: "iMac MLM Software",
    category: "MLM Software Company",
    description: "Revolutionize Your Network Marketing Business with iMac MLM. Empower your MLM with our cutting-edge, premium software designed for growth and success. Features intuitive dashboards, automated commissions, and lead management.",
    phone: "+1 800 MLM IMAC",
    address: "123 MLM Avenue, Suite 456, Tech City, TC 78901",
    user: "64ed7b000000000000000000" // Dummy ObjectId
};

const run = async () => {
    // 1. Cleanup old leads with same phone if any (manual or just run)
    console.log("🧹 Cleaning up...");
    // node-fetch delete if endpoint existed, otherwise just let it fail or handle in script.

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
    console.log("\n🚀 Step 2: Generating site code with GUARANTEED IMAGES & THEME...");
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
            instructions: "Create a world-class MLM software marketing page. MUST HAVE: Working testimonial images (use the provided IDs), a perfectly visible footer in both dark and light modes, and a clear pricing/feature section. Aesthetic: Futuristic, Professional, Trustworthy. Use deep purples and blacks for dark mode, clean white/gray for light mode."
        })
    });

    const genData = await genRes.json();
    if (genData.error) {
        console.error("❌ Site generation failed:", genData.error, genData.message);
        return;
    }

    console.log("\n✅ iMac MLM Site generated successfully!");
    console.log("🆔 Lead ID:", genData.leadId);
    console.log("🌐 Preview URL:", genData.previewUrl);
};

run();
