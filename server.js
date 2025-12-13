/* ------------------------------------------------------
   LOAD ENV (ESM SAFE)
------------------------------------------------------ */
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

/* ------------------------------------------------------
   IMPORTS
------------------------------------------------------ */
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

/* MODELS */
import User from "./src/models/User.js";

/* CRONS */
import { startInstagramCron } from "./src/cron/instagramCron.js";
import { runFollowupCron } from "./src/cron/followupChecker.js";

/* ------------------------------------------------------
   INIT APP
------------------------------------------------------ */
const app = express();
app.disable("etag");

/* ------------------------------------------------------
   CORS CONFIG
------------------------------------------------------ */
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      const allowed = [
        "http://localhost:3000",
        "http://localhost:5173",
        "https://iqsync.in",
        /\.iqsync\.in$/,
      ];

      if (allowed.includes(origin)) return callback(null, true);
      if (allowed.some((rule) => rule instanceof RegExp && rule.test(origin)))
        return callback(null, true);

      console.log("❌ BLOCKED ORIGIN:", origin);
      return callback(new Error("CORS Blocked: " + origin));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.options("*", cors());

/* ------------------------------------------------------
   BODY PARSING
------------------------------------------------------ */
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

/* ------------------------------------------------------
   ROUTES
------------------------------------------------------ */
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/instagram", instagramRoutes);
app.use("/api/deploy", deployRoutes);
app.use("/api/sites", kvRoutes);

/* ------------------------------------------------------
   HEALTH CHECK
------------------------------------------------------ */
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    message: "IQSync Lead Generator Backend Running 🚀",
  });
});

/* ------------------------------------------------------
   CREATE DEFAULT SUPER ADMIN
------------------------------------------------------ */
async function createSuperAdmin() {
  const email = process.env.ADMIN_DEFAULT_EMAIL;
  const password = process.env.ADMIN_DEFAULT_PASSWORD;

  if (!email || !password) {
    console.log(
      "⚠️ ADMIN_DEFAULT_EMAIL or ADMIN_DEFAULT_PASSWORD not set in .env"
    );
    return;
  }

  const exists = await User.findOne({ email });
  if (exists) {
    console.log("✅ Super Admin already exists:", email);
    return;
  }

  const hashed = await bcrypt.hash(password, 10);

  await User.create({
    email,
    password: hashed,
    role: "SUPER_ADMIN",
    isActive: true,
  });

  console.log("🎉 Super Admin created:", email);
}

/* ------------------------------------------------------
   START SERVER + DB
------------------------------------------------------ */
const PORT = process.env.PORT || 5010;

connectDB()
  .then(createSuperAdmin)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Backend running on PORT ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Server failed to start:", err);
  });

/* ------------------------------------------------------
   CRON JOBS
------------------------------------------------------ */
startInstagramCron();

cron.schedule("0 * * * *", () => {
  console.log("🔁 Running Follow-up Cron...");
  runFollowupCron();
});
