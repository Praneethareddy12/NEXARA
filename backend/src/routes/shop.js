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

    const item = ITEMS[itemId];
    if (!item) return res.status(400).json({ message: "Invalid item" });

    if (user.coins < item.price) {
      return res.status(400).json({ message: "Not enough coins" });
    }

    user.coins -= item.price;

    // ADD TO INVENTORY
    user.inventory[itemId] += 1;

    await user.save();

    res.json({
      message: `${itemId} purchased successfully!`,
      user
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ❄️ ACTIVATE STREAK FREEZE (USE FROM INVENTORY)
router.post("/activate-freeze", protect, async (req, res) => {
  const user = await User.findById(req.user.id);

  if (user.inventory.freeze <= 0) {
    return res.status(400).json({ message: "No freeze available" });
  }

  user.inventory.freeze -= 1;
  user.streakFreezeActive = true;

  await user.save();

  res.json({ message: "Streak Freeze Activated!" });
});

// ⚡ ACTIVATE DOUBLE XP
router.post("/activate-doublexp", protect, async (req, res) => {
  const user = await User.findById(req.user.id);

  if (user.inventory.doublexp <= 0) {
    return res.status(400).json({ message: "No Double XP available" });
  }

  user.inventory.doublexp -= 1;
  user.activeEffects.doubleXP = new Date(Date.now() + 2 * 60 * 60 * 1000);

  await user.save();

  res.json({ message: "Double XP Activated!" });
});

export default router;