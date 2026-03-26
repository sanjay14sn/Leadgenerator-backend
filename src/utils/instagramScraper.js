import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import Lead from "../models/Lead.js";
import fs from "fs";
import fetch from "node-fetch";
import { extractPhoneFromWhatsApp } from "./phoneExtractor.js";

puppeteer.use(StealthPlugin());

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

/* ---------------------------------
   USER AGENTS
--------------------------------- */
const UA_LIST = [
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
];
const getUA = () => UA_LIST[Math.floor(Math.random() * UA_LIST.length)];

/* ---------------------------------
   SIMPLE PHONE EXTRACTOR
--------------------------------- */
function extractAnyPhone(text) {
  if (!text) return null;
  const clean = text.replace(/[\s\-\(\).]/g, "");
  const match = clean.match(/(\+91)?\d{8,12}/);
  return match ? match[0] : null;
}

/* ---------------------------------
   AI PHONE EXTRACTOR (SAFE)
--------------------------------- */
async function extractPhoneAI(text) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey || !text) return null;

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-flash-1.5",
        messages: [
          {
            role: "user",
            content: `Extract the primary phone number. Return digits only or "null".\n${text}`,
          },
        ],
      }),
    });

    const json = await res.json().catch(() => null);
    const raw = json?.choices?.[0]?.message?.content?.trim();

    if (!raw || raw.toLowerCase() === "null") return null;
    return raw.replace(/\D/g, "");
  } catch {
    return null;
  }
}

/* ---------------------------------
   PROFILE DATA SCRAPER (SAFE)
--------------------------------- */
async function getProfileData(page) {
  try {
    return await page.evaluate(() => {
      const header = document.querySelector("header");
      if (!header) return null;

      const name =
        header.querySelector("h1")?.innerText ||
        header.querySelector("h2")?.innerText ||
        null;

      if (!name) return null;

      let bio =
        document.querySelector('div[data-testid="user-bio"]')?.innerText ||
        document.querySelector("h1 + div span")?.innerText ||
        "";

      const website =
        document.querySelector(
          'a[target="_blank"][rel="nofollow noopener noreferrer"]'
        )?.href || "";

      return {
        name,
        bio,
        website,
        email: null,
      };
    });
  } catch {
    return null;
  }
}

/* ---------------------------------
   SCRAPE SINGLE PROFILE
--------------------------------- */
async function scrapeProfile(browser, postURL, userId) {
  const page = await browser.newPage();
  await page.setUserAgent(getUA());

  try {
    await page.goto(postURL, { waitUntil: "networkidle2", timeout: 60000 });
    await sleep(2000);

    const profileUrl = await page.evaluate(() => {
      const links = [...document.querySelectorAll("a")];
      const profile = links.find(
        (a) =>
          a.href.includes("instagram.com/") &&
          !a.href.includes("/p/") &&
          !a.href.includes("/explore/")
      );
      return profile?.href || null;
    });

    if (!profileUrl) return null;

    await page.goto(profileUrl, { waitUntil: "networkidle2", timeout: 60000 });
    await sleep(2000);

    const profileData = await getProfileData(page);
    if (!profileData) return null;

    const allText = `
      NAME: ${profileData.name}
      BIO: ${profileData.bio}
      WEBSITE: ${profileData.website}
    `;

    const phone =
      extractPhoneFromWhatsApp(allText) ||
      extractAnyPhone(allText) ||
      (await extractPhoneAI(allText));

    const username = profileUrl.split(".com/")[1]?.replace("/", "") || "";

    /* ---------------------------------
       UPSERT (NO CONFLICTS)
    --------------------------------- */
    await Lead.updateOne(
      { user: userId, profileUrl },
      {
        $setOnInsert: {
          user: userId,
          profileUrl,
          username,
          createdAt: new Date(),
        },
        $set: {
          phone: phone || null,
          name: profileData.name,
          bio: profileData.bio,
          website: profileData.website,
          email: profileData.email,
          source: "instagram",
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    console.log(`✅ Instagram lead saved: ${username}`);
    return { username, phone };
  } catch (err) {
    console.error("Profile scrape error:", err.message);
    return null;
  } finally {
    await page.close();
  }
}

/* ---------------------------------
   MAIN SCRAPER
--------------------------------- */
async function scrapeInstagramURL(pageURL, userId, limit = 10) {
  let browser;

  try {
    browser = await puppeteer.launch({
      headless: false,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setUserAgent(getUA());

    try {
      const cookies = JSON.parse(
        fs.readFileSync("./src/utils/igCookies.json")
      );
      await page.setCookie(...cookies);
    } catch { }

    await page.goto(pageURL, { waitUntil: "networkidle2", timeout: 60000 });
    await sleep(2000);

    for (let i = 0; i < 10; i++) {
      await page.evaluate(() => window.scrollBy(0, window.innerHeight));
      await sleep(700);
    }

    let posts = await page.$$eval('a[href*="/p/"]', (a) =>
      [...new Set(a.map((x) => x.href))]
    );

    posts = posts.slice(0, limit);

    for (const post of posts) {
      const lead = await scrapeProfile(browser, post, userId);
      if (lead) break;
    }
  } catch (err) {
    console.error("Instagram scraper error:", err.message);
  } finally {
    if (browser) await browser.close();
  }
}

/* ---------------------------------
   EXPORTED FUNCTIONS
--------------------------------- */
export async function scrapeInstagramHashtag(tag, userId, limit = 10) {
  return scrapeInstagramURL(
    `https://www.instagram.com/explore/tags/${tag}/`,
    userId,
    limit
  );
}

export async function scrapeLocationRestaurants(locationId, userId, limit = 10) {
  return scrapeInstagramURL(
    `https://www.instagram.com/explore/locations/${locationId}/`,
    userId,
    limit
  );
}
