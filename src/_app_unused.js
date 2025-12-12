// src/app.js

import express from "express";
import cors from "cors";

// ROUTES ONLY — NO CONTROLLERS HERE
import leadRoutes from "./routes/leadRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import instagramRoutes from "./routes/instagramRoutes.js";
import deployRoutes from "./routes/deployRoutes.js";
import kvRoutes from "./routes/kvRoutes.js";

const app = express();

// ⭐ CRITICAL FIX: Disable Etag to prevent Express from 
// sending a 304 Not Modified response before running your controller logic.
app.set('etag', false); 

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// ROUTES
app.use("/api/leads", leadRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/instagram", instagramRoutes);
app.use("/api/deploy", deployRoutes);

// KV WEBSITE ROUTES
app.use("/api/sites", kvRoutes);

app.get("/", (req, res) => {
  res.json({ status: "OK", message: "Lead Generator Backend Running 🚀" });
});

export default app;