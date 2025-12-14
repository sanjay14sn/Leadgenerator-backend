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
app.disable("etag");

/* CORS */
app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

/* ROUTES */
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

/* CREATE SUPER ADMIN */
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

const PORT = process.env.PORT || 5010;

connectDB()
  .then(createSuperAdmin)
  .then(() => {
    app.listen(PORT, () =>
      console.log(`🚀 Server running on ${PORT}`)
    );
  });

startInstagramCron();
cron.schedule("0 * * * *", runFollowupCron);
