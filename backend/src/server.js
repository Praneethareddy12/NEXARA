import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import passport from "passport";
import session from "express-session"; // Required for session persistence
import initPassport from "./config/passport.js";
import authRoutes from "./routes/auth.routes.js";
import progressRoutes from "./routes/progressRoutes.js";
dotenv.config();

const app = express();

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
    MIDDLEWARE (Strict Order)
============================== */
// 1. CORS for Frontend
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// 2. Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Session initialization (Crucial for OAuth state)
app.use(
  session({
    secret: process.env.JWT_SECRET || "supersecretkey",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true if using HTTPS
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// 4. Passport initialization
initPassport();
app.use(passport.initialize());
app.use(passport.session());

/* ==============================
    ROUTES
============================== */
// Progress & Challenges
app.use('/api/progress', progressRoutes);

// Authentication & User Routes
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