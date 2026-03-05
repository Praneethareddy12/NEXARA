import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import passport from "passport";
import initPassport from "./config/passport.js";
import authRoutes from "./routes/auth.routes.js";

dotenv.config();

const app = express();

const progressRoutes = require('./routes/progressRoutes');

/* ==============================
    CONNECT TO MONGODB
============================== */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  });

/* ==============================
    MIDDLEWARE
============================== */
// CORS must be first to allow frontend requests
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Body parser must be before routes to read JSON data
app.use(express.json());

app.use('/api/progress', progressRoutes);

/* ==============================
    INIT PASSPORT
============================== */
initPassport();
app.use(passport.initialize());

/* ==============================
    ROUTES
============================== */
// Authentication & User Progress Routes
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("🚀 SkillUp Nexus Backend Running");
});

/* ==============================
    START SERVER
============================== */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});