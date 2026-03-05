import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card'
import { Button } from '@/Components/ui/button'
import { Badge } from '@/Components/ui/badge'
import { Clock, Award, Lock, CheckCircle2, BookOpen } from 'lucide-react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { createPageUrl } from '../utils'

const difficultyColors = {
  beginner: "bg-green-100 text-green-800 border-green-200",
  intermediate: "bg-blue-100 text-blue-800 border-blue-200",
  advanced: "bg-purple-100 text-purple-800 border-purple-200",
  expert: "bg-red-100 text-red-800 border-red-200"
};

export default function PathCard({ path, progress = 0, isLocked = false, index = 0 }) {
  const isCompleted = progress === 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className={`group hover:shadow-xl transition-all duration-300 border-none ${
        isLocked ? 'opacity-60' : 'hover:-translate-y-1'
      }`}>
        <CardHeader className="relative">
          {isLocked && (
            <div className="absolute top-4 right-4">
              <Lock className="w-5 h-5 text-slate-400" />
            </div>
          )}
          {isCompleted && (
            <div className="absolute top-4 right-4">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
          )}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl shadow-lg">
              {path.icon || '📚'}
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg font-bold">{path.title}</CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                {path.description}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className={difficultyColors[path.difficulty]}>
              {path.difficulty}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {path.estimated_hours}h
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Award className="w-3 h-3" />
              {path.xp_reward} XP
            </Badge>
          </div>

          {path.modules && path.modules.length > 0 && (
            <div className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              {path.modules.length} modules
            </div>
          )}

          {progress > 0 && !isLocked && (
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">Progress</span>
                <span className="font-semibold">{progress}%</span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-600"
                />
              </div>
            </div>
          )}

          <Link to={createPageUrl('PathDetail', `id=${path.id}`)}>
            <Button 
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              disabled={isLocked}
            >
              {isCompleted ? 'Review' : progress > 0 ? 'Continue' : 'Start Learning'}
            </Button>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
}