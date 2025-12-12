// server.js (or index.js, the main entry point)

// --------------------------------------
// LOAD ENV FIRST
// --------------------------------------
import dotenv from "dotenv";
dotenv.config();

// --------------------------------------
import express from "express";
import cors from "cors";

// Assuming these are your routes (which point to your controllers)
import leadRoutes from "./src/routes/leadRoutes.js";
import aiRoutes from "./src/routes/aiRoutes.js";
import instagramRoutes from "./src/routes/instagramRoutes.js";
import deployRoutes from "./src/routes/deployRoutes.js";
import kvRoutes from "./src/routes/kvRoutes.js"; // KV routes

// Other services
import connectDB from "./src/config/db.js";
import { startInstagramCron } from "./src/cron/instagramCron.js";
import cron from "node-cron";
import { runFollowupCron } from "./src/cron/followupChecker.js";

// --- EXPRESS APP SETUP (REPLACING src/app.js content) ---
const app = express();

// ⭐ CRITICAL FIX: Disable Etag to prevent Express from sending 304 Not Modified
app.set('etag', false); 

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// --- ROUTE REGISTRATION ---
app.use("/api/leads", leadRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/instagram", instagramRoutes);
app.use("/api/deploy", deployRoutes);
app.use("/api/sites", kvRoutes); // KV WEBSITE ROUTES

app.get("/", (req, res) => {
  res.json({ status: "OK", message: "Lead Generator Backend Running 🚀" });
});
// -----------------------------------------------------

// CONNECT DB
connectDB();

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// START DAILY INSTAGRAM CRON
startInstagramCron();

// START FOLLOW-UP CRON EVERY 1 HOUR
cron.schedule("0 * * * *", () => {
  runFollowupCron();
});