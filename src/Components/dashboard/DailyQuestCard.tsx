import React from 'react'
import { Trophy, Coins, Zap } from 'lucide-react'
import { motion } from 'framer-motion'

interface Quest {
  title: string
  description: string
  target_value?: number
  xp_reward?: number
  coin_reward?: number
}

interface Props {
  quest: Quest
  progress?: number
  onComplete?: () => void
}

export default function DailyQuestCard({
  quest,
  progress = 0,
  onComplete,
}: Props) {
  const target = quest?.target_value ?? 100
  const isCompleted = progress >= target

  return (
    <div className="p-6 rounded-xl shadow-lg bg-gradient-to-br from-yellow-50 to-amber-50">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-600" />
          Daily Quest
        </h2>

        {isCompleted && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="bg-green-500 text-white text-xs px-3 py-1 rounded-full font-semibold"
          >
            ✓ Complete
          </motion.div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-slate-800">{quest?.title}</h3>
          <p className="text-sm text-slate-600 mt-1">
            {quest?.description}
          </p>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Progress</span>
            <span className="font-semibold">
              {progress} / {target}
            </span>
          </div>

          <div className="w-full bg-gray-200 h-2 rounded">
            <div
              className="bg-yellow-500 h-2 rounded"
              style={{ width: `${(progress / target) * 100}%` }}
            />
          </div>
        </div>

        {/* Rewards */}
        <div className="flex items-center gap-4 pt-2">
          <div className="flex items-center gap-1 text-sm">
            <Zap className="w-4 h-4 text-indigo-600" />
            <span className="font-semibold">{quest?.xp_reward} XP</span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <Coins className="w-4 h-4 text-yellow-600" />
            <span className="font-semibold">{quest?.coin_reward} Coins</span>
          </div>
        </div>

        {!isCompleted && progress >= target && (
          <button
            onClick={onComplete}
            className="w-full py-2 rounded-lg text-white bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700"
          >
            Claim Reward
          </button>
        )}
      </div>
    </div>
  )
}
