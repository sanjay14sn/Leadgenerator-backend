/* ------------------------------------------------------
   LOAD ENV (ESM SAFE)
------------------------------------------------------ */
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Resolve __dirname since ESM doesn't provide it
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Force dotenv to load .env from root folder
dotenv.config({ path: path.join(__dirname, ".env") });

console.log("🔑 Loaded SERP_KEYS:", process.env.SERP_KEYS);

/* ------------------------------------------------------
   IMPORTS
------------------------------------------------------ */
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

/* ------------------------------------------------------
   INIT APP
------------------------------------------------------ */
const app = express();
app.disable("etag");

/* ------------------------------------------------------
   ⭐ CORS — ALLOW iqsync.in + SUBDOMAINS + LOCALHOST
------------------------------------------------------ */
const rootDomainRegex = /\.?iqsync\.in$/;

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // mobile apps, postman, server-to-server

      try {
        const hostname = new URL(origin).hostname;

        // Localhost allowed
        if (hostname === "localhost" || hostname === "127.0.0.1") {
          return callback(null, true);
        }

        // iqsync.in + *.iqsync.in
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

app.options("*", cors()); // Preflight fix

/* ------------------------------------------------------
   BODY PARSING
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
   START DB + SERVER
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
