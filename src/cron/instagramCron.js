import cron from "node-cron";
import { scrapeHashtag } from "../controllers/instagramController.js";

export function startInstagramCron() {
  cron.schedule("0 10 * * *", () => {   // every day 10 AM
    console.log("Running daily Instagram scraping…");
    scrapeHashtag({ params: { tag: "chennaifood" } }, { json: () => {} });
  });
}
