import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import User from "../models/User.js";

const router = express.Router();

const ITEMS = {
  freeze: { price: 50 },
  doublexp: { price: 150 },
  hint: { price: 30 },
  skip: { price: 80 }
};

// 🛒 BUY ITEM
router.post("/buy", protect, async (req, res) => {
  try {
    const { itemId } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const item = ITEMS[itemId];
    if (!item) return res.status(400).json({ message: "Invalid item" });

    if (user.coins < item.price) {
      return res.status(400).json({ message: "Not enough coins" });
    }

    user.coins -= item.price;

    // HANDLE FREEZE SPECIALLY - ACTIVATE IMMEDIATELY
    if (itemId === "freeze") {
      if (user.streakFreezeActive) {
        return res.status(400).json({ message: "You already have an active freeze!" });
      }
      user.streakFreezeActive = true;
      await user.save();
      return res.json({
        message: "Streak Freeze Activated!",
        user
      });
    }

    // ALL OTHER ITEMS - ADD TO INVENTORY
    user.inventory[itemId] += 1;
    await user.save();

    res.json({
      message: `${itemId} purchased successfully!`,
      user
    });
  } catch (err) {
    console.error("Shop Buy Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ⚡ ACTIVATE DOUBLE XP
router.post("/activate-doublexp", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.inventory.doublexp <= 0) {
      return res.status(400).json({ message: "No Double XP available" });
    }

    user.inventory.doublexp -= 1;
    user.doubleXpExpires = new Date(Date.now() + 2 * 60 * 60 * 1000);

    await user.save();

    res.json({ message: "Double XP Activated!", user });
  } catch (err) {
    console.error("Activate Double XP Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 💡 USE HINT TOKEN
router.post("/use-hint", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.inventory.hint <= 0) {
      return res.status(400).json({ message: "No hints available" });
    }

    user.inventory.hint -= 1;
    await user.save();

    res.json({ message: "Hint Used!", user });
  } catch (err) {
    console.error("Use Hint Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ⏭️ USE SKIP TOKEN
router.post("/use-skip", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.inventory.skip <= 0) {
      return res.status(400).json({ message: "No skips available" });
    }

    user.inventory.skip -= 1;
    await user.save();

    res.json({ message: "Challenge Skipped!", user });
  } catch (err) {
    console.error("Use Skip Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;