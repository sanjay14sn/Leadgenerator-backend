import express from "express";
import cors from "cors";

// ROUTES
import leadRoutes from "./routes/leadRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import instagramRoutes from "./routes/instagramRoutes.js";
import deployRoutes from "./routes/deployRoutes.js";

const app = express();

/* -----------------------------------------
   ⭐ FIXED CORS FOR FRONTEND + WORKER
------------------------------------------ */
app.use(cors({
  origin: "*",              // allow all domains
  methods: "GET,POST,PATCH,PUT,DELETE",
  allowedHeaders: "Content-Type, Authorization"
}));

app.use(express.json());

/* -----------------------------------------
   ROUTES
------------------------------------------ */

// Instagram
app.use("/api/instagram", instagramRoutes);

// AI Enhance
app.use("/api/ai", aiRoutes);

// Leads CRUD
app.use("/api/leads", leadRoutes);

// ⭐ Publish Website
app.use("/api/deploy", deployRoutes);

/* -----------------------------------------
   HEALTH CHECK
------------------------------------------ */
app.get("/", (req, res) => {
  res.json({ status: "OK", message: "Lead Generator Backend Running 🚀" });
});

/* -----------------------------------------
   ERROR HANDLER
------------------------------------------ */
app.use((err, req, res, next) => {
  console.error("🔥 SERVER ERROR:", err);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: err.message,
  });
});

export default app;
