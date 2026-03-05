import React from 'react';
import { Card } from "@/components/ui/card";
import { motion } from 'framer-motion';

export default function StatCard({ icon: Icon, label, value, gradient, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
    >
      <Card className="p-6 border-none shadow-lg bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
            <p className="text-3xl font-bold mt-2 bg-gradient-to-r bg-clip-text text-transparent" style={{
              backgroundImage: gradient
            }}>
              {value}
            </p>
          </div>
          <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}