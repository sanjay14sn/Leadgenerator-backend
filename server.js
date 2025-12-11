import dotenv from "dotenv";
dotenv.config();

// correct paths
import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import { startInstagramCron } from "./src/cron/instagramCron.js";

// CONNECT DB
connectDB();

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// START DAILY CRON
startInstagramCron();
