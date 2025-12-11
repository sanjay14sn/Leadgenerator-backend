import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import Lead from "../models/Lead.js"; 
import fs from "fs";
import fetch from "node-fetch";
// NOTE: Make sure these paths are correct in your project!
import { extractPhoneFromWhatsApp } from "./phoneExtractor.js"; 

// Use Stealth plugin to prevent basic bot detection
puppeteer.use(StealthPlugin());

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

const UA_LIST = [
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
];
const getUA = () => UA_LIST[Math.floor(Math.random() * UA_LIST.length)];


// ===============================
// FALLBACK SIMPLE PHONE DETECTOR (Updated to accept 8-12 digits)
// ===============================
function extractAnyPhone(text) {
  if (!text) return null;
  const clean = text.replace(/[\s\-\(\).]/g, "");
  // CRITICAL CHANGE: Relaxing to match 8-12 digits to capture more numbers.
  const match = clean.match(/(\+91)?\d{8,12}/); 
  return match ? match[0] : null;
}


// ===============================
// AI PHONE DETECTOR (GEMINI 2.5 FLASH)
// ===============================
async function extractPhoneAI(text) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) return null;

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash", 
        messages: [
          {
            role: "user",
            content: `
Extract the primary contact phone number from this text.
Return ONLY digits. If no number is found, return "null".

TEXT:
${text}
            `,
          },
        ],
      }),
    });

    const json = await res.json();
    const raw = json?.choices?.[0]?.message?.content?.trim();

    if (!raw || raw.toLowerCase() === "null") return null;
    return raw.replace(/\D/g, "");
  } catch(e) {
    return null;
  }
}


// =====================================================
// SCRAPE VISIBLE PROFILE DATA
// =====================================================
async function getProfileData(page) {
  try {
    const data = await page.evaluate(() => {
        const header = document.querySelector('header');
        const username = header ? header.querySelector('h2')?.innerText : null;
        const name = header ? header.querySelector('h1')?.innerText : null;

        // Primary Bio Selector
        let bio = document.querySelector('div[data-testid="user-bio"]')?.innerText;
        
        // Fallback Bio Selector
        if (!bio) {
             bio = document.querySelector('h1 + div > div > span:not([data-testid])')?.innerText;
        }
        
        const websiteLink = document.querySelector('a[target="_blank"][rel="nofollow noopener noreferrer"]');
        const website = websiteLink ? websiteLink.href : "";

        if (!username && !name) return null;
        
        return {
            name: name || username,
            bio: bio || "",
            website: website,
            email: null, 
        };
    });

    if (!data || !data.name) {
      return null; 
    }
    return data;
  } catch {
    return null;
  }
}


// =====================================================
// SCRAPE ONE PROFILE
// =====================================================
async function scrapeProfile(browser, postURL) {
  const page = await browser.newPage();
  await page.setUserAgent(getUA());

  try {
    // 1. Go to Post URL and try to close any popups
    await page.goto(postURL, { waitUntil: "networkidle2", timeout: 60000 });
    await sleep(2000); 

    // --- Attempt to close initial Post page modal ---
    try {
        const notNowButtonSelector = 'div[role="dialog"] button:nth-child(2)';
        await page.waitForSelector(notNowButtonSelector, { timeout: 3000 });
        await page.click(notNowButtonSelector);
        console.log(`[${postURL}] Closed login modal on post page.`);
        await sleep(1000);
    } catch (e) {}

    // 2. Find Profile URL 
    const profileUrl = await page.evaluate(() => {
        // STRATEGY 1: The most common structural selector 
        const headerLink = document.querySelector('header a[role="link"]');
        if (headerLink && !headerLink.href.includes("/p/")) return headerLink.href;

        // STRATEGY 2: Find the link wrapping the username text/span
        const usernameSpan = document.querySelector('header span a');
        if (usernameSpan && !usernameSpan.href.includes("/p/")) return usernameSpan.href;

        // STRATEGY 3: Last resort - Find ALL links and filter
        const allLinks = [...document.querySelectorAll('a')];
        const profileLink = allLinks.find(a => 
            a.href.includes('instagram.com/') && 
            !a.href.includes('/p/') &&           
            !a.href.includes('/explore/') &&      
            !a.href.includes('/liked_by/') &&     
            a.href.length > 'https://www.instagram.com/'.length + 2 && 
            a.href !== window.location.href       
        );

        return profileLink ? profileLink.href : null;
    });

    if (!profileUrl) {
      console.log(`[${postURL}] Could not find profile URL on post page.`);
      return null;
    }

    // 3. Go to Profile URL
    await page.goto(profileUrl, { waitUntil: "networkidle2", timeout: 60000 });
    await sleep(2500); 

    // --- Attempt to close Profile page modal ---
     try {
        const profileModalSelector = 'div[role="dialog"] button:nth-child(2)';
        await page.waitForSelector(profileModalSelector, { timeout: 3000 });
        await page.click(profileModalSelector);
        console.log(`[${profileUrl}] Closed login modal on profile page.`);
        await sleep(1000);
    } catch (e) {}
    
    await sleep(1000);

    // 4. Extract Profile Data
    const profileData = await getProfileData(page);
    
    if (!profileData || !profileData.name) { 
        console.log(`[${profileUrl}] Could not extract profile data (may be private or failed selector).`);
        return null; 
    }
    
    // 5. Check if the account is explicitly private
    const isPrivate = await page.evaluate(() => 
        document.body.innerText.includes("This Account is Private")
    );
    if (isPrivate) {
        console.log(`[${profileUrl}] Account is private, skipping.`);
        return null;
    }

    // 6. Combine all text for phone detection
    const allText = `
NAME: ${profileData.name}
BIO: ${profileData.bio}
WEBSITE: ${profileData.website}
    `;

    // 7. Try all phone detection methods
    const phone =
      extractPhoneFromWhatsApp(allText) ||
      extractAnyPhone(allText) ||
      (await extractPhoneAI(allText));

    if (!phone) {
        console.log(`[${profileUrl}] No phone number found. Saving partial data.`);
    }

    // 8. Save Lead (THIS IS NOW DONE REGARDLESS OF PHONE STATUS)
    const username = profileUrl.split(".com/")[1].replace("/", "");

    await Lead.create({
      profileUrl,
      username,
      phone: phone || null, // Set phone to null if not found
      name: profileData.name,
      bio: profileData.bio,
      website: profileData.website,
      email: profileData.email,
      source: "instagram",
    });

    if (phone) {
        console.log(`✅ Success: Found phone ${phone} for ${username}`);
    } else {
        console.log(`✅ Success: Saved partial data for ${username} (No Phone).`);
    }

    return {
      profileUrl,
      phone,
      ...profileData,
    };

  } catch (err) {
    console.log(`Profile scrape error for ${postURL}:`, err.message);
    return null;
  } finally {
    await page.close();
  }
}


// =====================================================
// MAIN SCRAPER ENGINE
// =====================================================
async function scrapeInstagramURL(pageURL, limit = 10) {
  let browser;
  try {
    browser = await puppeteer.launch({
        // >>>>> HEADLESS: FALSE REMAINS FOR VISUAL CONFIRMATION <<<<<
        headless: false, 
        args: [
            "--no-sandbox", 
            "--disable-setuid-sandbox", 
            "--window-size=1400,1100"
        ],
        defaultViewport: { width: 1400, height: 1100 },
    });

    const page = await browser.newPage();
    await page.setUserAgent(getUA());

    // Load IG cookies if available
    try {
      const cookies = JSON.parse(fs.readFileSync("./src/utils/igCookies.json"));
      await page.setCookie(...cookies);
      console.log("Cookies loaded successfully.");
    } catch (e) {
        console.log("No valid cookies found. Scraping as an unauthenticated user.");
    }

    await page.goto(pageURL, { waitUntil: "networkidle2", timeout: 60000 });
    await sleep(2000);

    // Scroll down multiple times to load more posts
    console.log("Scrolling to load more posts...");
    for (let i = 0; i < 15; i++) {
      await page.evaluate(() => window.scrollBy(0, window.innerHeight));
      await sleep(700); 
    }
    console.log("Finished scrolling.");


    let posts = await page.$$eval('a[href*="/p/"]', (a) => a.map((x) => x.href));
    posts = [...new Set(posts)].slice(0, limit);
    console.log(`Found ${posts.length} unique posts to process.`);

    const results = [];

    for (const post of posts) {
      const lead = await scrapeProfile(browser, post);
      if (lead) {
        results.push(lead);
        // Break after finding the first lead (partial or full)
        break; 
      }
    }

    return results;

  } catch (error) {
    console.error("Main scrape error:", error.message);
    return [];
  } finally {
    if (browser) {
      // Keep the browser open after the scrape to review the last profile if needed.
      // If you want it to close automatically, uncomment the line below.
      // await browser.close();
    }
  }
}


// Export functions
export async function scrapeInstagramHashtag(tag, limit = 10) {
  return await scrapeInstagramURL(
    `https://www.instagram.com/explore/tags/${tag}/`,
    limit
  );
}

export async function scrapeLocationRestaurants(locationId, limit = 10) {
  return await scrapeInstagramURL(
    `https://www.instagram.com/explore/locations/${locationId}/`,
    limit
  );
}