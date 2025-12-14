import path from "path";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import express from "express";
import cors from "cors";
import cron from "node-cron";
import bcrypt from "bcryptjs";

import connectDB from "./src/config/db.js";

/* ROUTES */
import authRoutes from "./src/routes/authRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import leadRoutes from "./src/routes/leadRoutes.js";
import aiRoutes from "./src/routes/aiRoutes.js";
import instagramRoutes from "./src/routes/instagramRoutes.js";
import deployRoutes from "./src/routes/deployRoutes.js";
import kvRoutes from "./src/routes/kvRoutes.js";
import teammateRoutes from "./src/routes/teammateRoutes.js";

/* MODELS */
import User from "./src/models/User.js";

/* CRONS */
import { startInstagramCron } from "./src/cron/instagramCron.js";
import { runFollowupCron } from "./src/cron/followupChecker.js";

const app = express();

/* -------------------------------------------------
   CRITICAL FIXES
------------------------------------------------- */
app.disable("etag"); // avoid 304 cache issues

/* -------------------------------------------------
   CORS (FIXED + SAFE)
------------------------------------------------- */
const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://iqsync.in",
  "https://www.iqsync.in",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow Postman, curl, server-to-server
      if (!origin) return callback(null, true);

      // DEV: localhost + LAN
      if (
        origin.startsWith("http://localhost") ||
        origin.startsWith("http://127.0.0.1") ||
        origin.startsWith("http://192.168.")
      ) {
        return callback(null, true);
      }

      // PROD
      if (
        origin === "https://iqsync.in" ||
        origin === "https://www.iqsync.in"
      ) {
        return callback(null, true);
      }

      console.log("❌ Blocked by CORS:", origin);
      return callback(null, false); // ✅ NEVER throw
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// MUST be after cors()
app.options("*", cors());

// PRE-FLIGHT
app.options("*", cors());

/* -------------------------------------------------
   BODY PARSER
------------------------------------------------- */
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

/* -------------------------------------------------
   ROUTES
------------------------------------------------- */
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/instagram", instagramRoutes);
app.use("/api/deploy", deployRoutes);
app.use("/api/sites", kvRoutes);
app.use("/api/teammates", teammateRoutes);

app.get("/", (req, res) => {
  res.json({ status: "OK", message: "Backend Running 🚀" });
});

/* -------------------------------------------------
   CREATE SUPER ADMIN
------------------------------------------------- */
async function createSuperAdmin() {
  const email = process.env.ADMIN_DEFAULT_EMAIL;
  const password = process.env.ADMIN_DEFAULT_PASSWORD;

  if (!email || !password) return;

  const exists = await User.findOne({ email });
  if (exists) return;

  const hashed = await bcrypt.hash(password, 10);

  await User.create({
    email,
    password: hashed,
    role: "SUPER_ADMIN",
    isActive: true,
  });

  console.log("🎉 Super Admin created:", email);
}

/* -------------------------------------------------
   SERVER START
------------------------------------------------- */
const PORT = process.env.PORT || 5010;

connectDB()
  .then(createSuperAdmin)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Server failed to start", err);
  });

/* -------------------------------------------------
   CRONS
------------------------------------------------- */
startInstagramCron();
cron.schedule("0 * * * *", runFollowupCron);
