import express from "express";
import cors from "cors";

// ROUTES
import leadRoutes from "./routes/leadRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import instagramRoutes from "./routes/instagramRoutes.js";
import deployRoutes from "./routes/deployRoutes.js"; // ⭐ NEW

const app = express();

app.use(cors());
app.use(express.json());

// Instagram
app.use("/api/instagram", instagramRoutes);

// AI
app.use("/api/ai", aiRoutes);

// Leads
app.use("/api/leads", leadRoutes);

// ⭐ NEW — Deployment / Publish Routes
app.use("/api/deploy", deployRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ status: "OK", message: "Lead Generator Backend Running 🚀" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("🔥 SERVER ERROR:", err);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: err.message,
  });
});

export default app;
