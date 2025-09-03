'use client'

import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'
import { motion } from 'framer-motion'

interface StatsCardProps {
  name: string
  value: string
  change: string
  changeType: 'positive' | 'negative' | 'neutral'
  icon: LucideIcon
}

export function StatsCard({ name, value, change, changeType, icon: Icon }: StatsCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="card p-6 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{name}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{value}</p>
          <div className="flex items-center mt-2">
            {changeType === 'positive' ? (
              <TrendingUp className="h-4 w-4 text-success-600 mr-1" />
            ) : changeType === 'negative' ? (
              <TrendingDown className="h-4 w-4 text-danger-600 mr-1" />
            ) : null}
            <span
              className={`text-sm font-medium ${
                changeType === 'positive'
                  ? 'text-success-600'
                  : changeType === 'negative'
                  ? 'text-danger-600'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              {change}
            </span>
          </div>
        </div>
        <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
          <Icon className="h-6 w-6 text-primary-600" />
        </div>
      </div>
    </motion.div>
  )
}
