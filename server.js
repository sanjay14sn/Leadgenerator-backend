// server.js (The complete, single entry point file)

// ---------------------------------------------
// 1. LOAD ENV FIRST
// ---------------------------------------------
import dotenv from "dotenv";
dotenv.config();

// ---------------------------------------------
// 2. IMPORTS
// ---------------------------------------------
import express from "express";
import cors from "cors";
import cron from "node-cron";

import connectDB from "./src/config/db.js";

// ROUTES — ENSURE THESE ARE IMPORTS FROM YOUR ROUTE FILES, NOT app.js
import leadRoutes from "./src/routes/leadRoutes.js";
import aiRoutes from "./src/routes/aiRoutes.js";
import instagramRoutes from "./src/routes/instagramRoutes.js";
import deployRoutes from "./src/routes/deployRoutes.js";
import kvRoutes from "./src/routes/kvRoutes.js";

// CRONS
import { startInstagramCron } from "./src/cron/instagramCron.js";
import { runFollowupCron } from "./src/cron/followupChecker.js";

// ---------------------------------------------
// 3. EXPRESS APP Initialization
// ---------------------------------------------
const app = express();

// ⭐ FIX: ETAG and CORS are correctly applied to this single 'app' instance
app.set("etag", false);

// ⭐ WIDEST CORS CONFIGURATION (Allows all origins)
app.use(cors());
app.options("*", cors()); // Handle pre-flight requests

// handle json body
app.use(express.json());

// ---------------------------------------------
// 4. ROUTES SETUP
// ---------------------------------------------
app.use("/api/leads", leadRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/instagram", instagramRoutes);
app.use("/api/deploy", deployRoutes);
app.use("/api/sites", kvRoutes); // Cloudflare KV routes

// TEST ROUTE
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    message: "Lead Generator Backend Running 🚀",
  });
});

// ---------------------------------------------
// 5. CONNECT DATABASE & START SERVER
// ---------------------------------------------
connectDB();

const PORT = process.env.PORT || 5009;

app.listen(PORT, () => {
  console.log(`🚀 Backend running on PORT ${PORT}`);
});

// ---------------------------------------------
// 6. CRON JOBS
// ---------------------------------------------
startInstagramCron();

cron.schedule("0 * * * *", () => {
  console.log("🔁 Running Follow-up Cron...");
  runFollowupCron();
});