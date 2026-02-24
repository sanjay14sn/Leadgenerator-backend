import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Setup __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from the root directory
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
import customPosterRoute from "./src/routes/customPosterRoute.js";

/* MODELS */
import User from "./src/models/User.js";

/* CRONS */
import { startInstagramCron } from "./src/cron/instagramCron.js";
import { runFollowupCron } from "./src/cron/followupChecker.js";

const app = express();

/* -------------------------------------------------
   1. STATIC FILES (CRITICAL FOR POSTERS)
------------------------------------------------- */
// This line allows http://localhost:5010/posters/image.png to work
app.use("/posters", express.static(path.join(__dirname, "public/posters")));

/* -------------------------------------------------
   2. MIDDLEWARE & CORS
------------------------------------------------- */
app.disable("etag");

const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://13.48.194.170",
  "http://13.48.194.170:3000",
  "https://iqsync.in",
  "https://www.iqsync.in",
  "http://api.iqsync.in",
  "https://api.iqsync.in"
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      
      const isDev = origin.startsWith("http://localhost") || 
                    origin.startsWith("http://127.0.0.1") || 
                    origin.startsWith("http://192.168.");
      const isProd = allowedOrigins.includes(origin);

      if (isDev || isProd) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

/* -------------------------------------------------
   3. ROUTES
------------------------------------------------- */
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/instagram", instagramRoutes);
app.use("/api/deploy", deployRoutes);
app.use("/api/sites", kvRoutes);
app.use("/api/teammates", teammateRoutes);

// Custom Poster Routes
app.use("/api", customPosterRoute);

app.get("/ping", (req, res) => res.send("pong 🏓"));
app.get("/", (req, res) => res.json({ status: "OK", message: "Backend Running 🚀" }));

/* -------------------------------------------------
   4. SUPER ADMIN SEEDING
------------------------------------------------- */
async function createSuperAdmin() {
  try {
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
    console.log("🎉 Super Admin seeded:", email);
  } catch (err) {
    console.error("❌ Failed to seed Admin:", err.message);
  }
}

/* -------------------------------------------------
   5. SERVER STARTUP
------------------------------------------------- */
const PORT = process.env.PORT || 5010;

connectDB()
  .then(createSuperAdmin)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      
      // Start Crons after server is up
      startInstagramCron();
      cron.schedule("0 * * * *", runFollowupCron);
      
      // OPTIONAL: Automatic cleanup of posters every midnight
      cron.schedule("0 0 * * *", async () => {
         console.log("🧹 Running daily poster cleanup...");
         // Add cleanup logic here if desired
      });
    });
  })
  .catch((err) => {
    console.error("❌ Database connection failed", err);
  });