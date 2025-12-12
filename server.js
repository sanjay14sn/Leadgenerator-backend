import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cron from "node-cron";

import connectDB from "./src/config/db.js";

import leadRoutes from "./src/routes/leadRoutes.js";
import aiRoutes from "./src/routes/aiRoutes.js";
import instagramRoutes from "./src/routes/instagramRoutes.js";
import deployRoutes from "./src/routes/deployRoutes.js";
import kvRoutes from "./src/routes/kvRoutes.js";

import { startInstagramCron } from "./src/cron/instagramCron.js";
import { runFollowupCron } from "./src/cron/followupChecker.js";

const app = express();

// Disable caching
app.disable("etag");

/* ------------------------------------------------------
   ⭐ FIXED CORS — ALLOWS ALL SUBDOMAINS OF iqsync.in
------------------------------------------------------ */

const rootDomainRegex = /\.?iqsync\.in$/;  
// matches: iqsync.in, www.iqsync.in, anything.iqsync.in

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // Postman/mobile apps

      try {
        const hostname = new URL(origin).hostname;

        // 1️⃣ Allow localhost for development
        if (hostname === "localhost" || hostname === "127.0.0.1") {
          return callback(null, true);
        }

        // 2️⃣ Allow iqsync.in + unlimited subdomains
        if (rootDomainRegex.test(hostname)) {
          return callback(null, true);
        }

        console.log("❌ BLOCKED ORIGIN:", origin);
        return callback(new Error("CORS blocked: " + origin));
      } catch (err) {
        console.log("❌ Invalid Origin:", origin);
        return callback(new Error("CORS error"));
      }
    },

    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// FIX preflight
app.options("*", cors());

/* ------------------------------------------------------
   BODY PARSER
------------------------------------------------------ */
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

/* ------------------------------------------------------
   ROUTES
------------------------------------------------------ */
app.use("/api/leads", leadRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/instagram", instagramRoutes);
app.use("/api/deploy", deployRoutes);
app.use("/api/sites", kvRoutes);

/* ------------------------------------------------------
   TEST ROUTE
------------------------------------------------------ */
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    message: "Lead Generator Backend Running 🚀",
  });
});

/* ------------------------------------------------------
   DATABASE + SERVER START
------------------------------------------------------ */
connectDB();

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`🚀 Backend running on PORT ${PORT}`);
});

/* ------------------------------------------------------
   CRON JOBS
------------------------------------------------------ */
startInstagramCron();

cron.schedule("0 * * * *", () => {
  console.log("🔁 Running Follow-up Cron...");
  runFollowupCron();
});
