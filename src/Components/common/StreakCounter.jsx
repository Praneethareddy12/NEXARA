import React from 'react';
import { Card } from "@/components/ui/card";
import { Flame } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StreakCounter({ currentStreak, longestStreak }) {
  return (
    <Card className="p-6 border-none shadow-lg bg-gradient-to-br from-orange-500 to-red-600 text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3
            }}
          >
            <Flame className="w-8 h-8" />
          </motion.div>
          <span className="text-lg font-semibold">Streak</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-bold">{currentStreak}</span>
          <span className="text-white/80">days</span>
        </div>
        <div className="mt-3 text-sm text-white/70">
          Best: {longestStreak} days
        </div>
      </div>
    </Card>
  );
}