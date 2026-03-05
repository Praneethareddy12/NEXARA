// backend/controllers/progressController.js
const User = require('../models/User'); // Adjust path to your User model

exports.completeChallenge = async (req, res) => {
    const { challengeId, xpEarned } = req.body;
    const userId = req.user.id; // Assuming you have auth middleware setting req.user

    try {
        const user = await User.findById(userId);
        
        // Prevent duplicate completion
        if (user.completedModules.includes(challengeId)) {
            return res.status(400).json({ message: "Challenge already completed" });
        }

        user.completedModules.push(challengeId);
        user.xp += xpEarned;
        await user.save();

        res.status(200).json({ message: "Progress saved!", newXp: user.xp });
    } catch (error) {
        res.status(500).json({ message: "Error updating progress" });
    }
};