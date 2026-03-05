import "dotenv/config";
import express from "express";
import cors from "cors";
import passport from "passport";
import session from "express-session";
import initPassport from "./config/passport.js";
import authRoutes from "./routes/auth.routes.js";

const app = express();

/*
====================================
BASIC CONFIG
====================================
*/
app.set("trust proxy", 1); // important for production (Render/Heroku)

/*
====================================
CORS
====================================
*/
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/*
====================================
BODY PARSER
====================================
*/
app.use(express.json());

/*
====================================
SESSION CONFIG
====================================
*/
app.use(
  session({
    secret: process.env.SESSION_SECRET || "nexara_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // change to true in production (https)
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

/*
====================================
PASSPORT INIT
====================================
*/
app.use(passport.initialize());
app.use(passport.session());

initPassport();

/*
====================================
ROUTES
====================================
*/
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("✅ SkillUp Nexus Backend is running");
});

/*
====================================
GLOBAL ERROR HANDLER
====================================
*/
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong" });
});

export default app;
