import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Award, Users, Trophy, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';

const difficultyConfig = {
  easy: { color: 'bg-green-100 text-green-800 border-green-200', gradient: 'from-green-500 to-emerald-600' },
  medium: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', gradient: 'from-yellow-500 to-orange-600' },
  hard: { color: 'bg-red-100 text-red-800 border-red-200', gradient: 'from-red-500 to-pink-600' },
  legendary: { color: 'bg-purple-100 text-purple-800 border-purple-200', gradient: 'from-purple-500 to-pink-600' }
};

export default function ChallengeCard({ challenge, isCompleted = false, index = 0 }) {
  const config = difficultyConfig[challenge.difficulty] || difficultyConfig.easy;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className={`group hover:shadow-2xl transition-all duration-300 border-none overflow-hidden ${
        challenge.is_boss_level ? 'ring-2 ring-purple-500' : ''
      }`}>
        {challenge.is_boss_level && (
          <div className="h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500" />
        )}
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {challenge.is_boss_level && (
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-bold text-purple-600">BOSS LEVEL</span>
                </div>
              )}
              <CardTitle className="text-lg font-bold group-hover:text-indigo-600 transition-colors">
                {challenge.title}
              </CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">
                {challenge.description}
              </p>
            </div>
            {isCompleted && (
              <Badge className="bg-green-500 text-white">✓ Done</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className={config.color}>
              {challenge.difficulty}
            </Badge>
            <Badge variant="outline">{challenge.category}</Badge>
            {challenge.time_limit_minutes && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {challenge.time_limit_minutes}m
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between py-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-sm">
                <Zap className="w-4 h-4 text-indigo-600" />
                <span className="font-semibold">{challenge.xp_reward} XP</span>
              </div>
              {challenge.coin_reward && (
                <div className="flex items-center gap-1 text-sm">
                  <Award className="w-4 h-4 text-yellow-600" />
                  <span className="font-semibold">{challenge.coin_reward} Coins</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Users className="w-3 h-3" />
              {challenge.completion_count || 0}
            </div>
          </div>

          {challenge.tags && challenge.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {challenge.tags.slice(0, 3).map((tag, i) => (
                <span key={i} className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-400">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <Link to={createPageUrl('ChallengeDetail', `id=${challenge.id}`)}>
            <Button className={`w-full bg-gradient-to-r ${config.gradient} hover:opacity-90 transition-opacity`}>
              {isCompleted ? 'Retry Challenge' : 'Start Challenge'}
            </Button>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
}