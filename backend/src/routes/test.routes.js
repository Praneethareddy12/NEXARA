import express from "express";
const router = express.Router();

router.get("/health", (req, res) => {
  res.json({ message: "Backend connected successfully 🚀" });
});

export default router;
