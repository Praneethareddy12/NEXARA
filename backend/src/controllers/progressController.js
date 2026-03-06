// Change: Switched from require() to import
import User from '../models/User.js'; 

export const completeChallenge = async (req, res) => {
    const { challengeId, xpEarned } = req.body;
    
    // Ensure req.user exists (set by your protect middleware)
    const userId = req.user._id; 

    try {
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Prevent duplicate completion
        // Make sure your User model has the 'completedChallenges' field defined
        if (user.completedChallenges && user.completedChallenges.includes(challengeId)) {
            return res.status(400).json({ message: "Challenge already completed" });
        }

        // Add to completed challenges and update XP
        user.completedChallenges = [...(user.completedChallenges || []), challengeId];
        user.xp = (user.xp || 0) + (xpEarned || 0);
        
        await user.save();

        res.status(200).json({ 
            message: "Progress saved!", 
            newXp: user.xp,
            completedChallenges: user.completedChallenges 
        });
    } catch (error) {
        console.error("Update error:", error);
        res.status(500).json({ message: "Error updating progress" });
    }
};