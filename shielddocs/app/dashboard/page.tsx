'use client'

import { motion } from 'framer-motion'
import { Shield, Lock, Users, BarChart3, Upload, FileText, Clock, Eye, Download, Share2 } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import { DocumentCard } from '@/components/document-card'
import { StatsCard } from '@/components/stats-card'
import { ActivityFeed } from '@/components/activity-feed'
import { QuickActions } from '@/components/quick-actions'

const recentDocuments = [
  {
    id: 1,
    name: 'Q4 Financial Report.pdf',
    type: 'PDF',
    size: '2.4 MB',
    uploadedAt: '2 hours ago',
    views: 12,
    downloads: 3,
    isShared: true,
    status: 'active'
  },
  {
    id: 2,
    name: 'Marketing Strategy.docx',
    type: 'DOCX',
    size: '1.8 MB',
    uploadedAt: '1 day ago',
    views: 8,
    downloads: 1,
    isShared: false,
    status: 'active'
  },
  {
    id: 3,
    name: 'Contract Template.pdf',
    type: 'PDF',
    size: '3.1 MB',
    uploadedAt: '3 days ago',
    views: 25,
    downloads: 7,
    isShared: true,
    status: 'active'
  }
]

const stats = [
  {
    name: 'Total Documents',
    value: '1,247',
    change: '+12%',
    changeType: 'positive',
    icon: FileText
  },
  {
    name: 'Active Collaborators',
    value: '89',
    change: '+5%',
    changeType: 'positive',
    icon: Users
  },
  {
    name: 'Storage Used',
    value: '2.4 GB',
    change: '+8%',
    changeType: 'neutral',
    icon: BarChart3
  },
  {
    name: 'Security Score',
    value: '98%',
    change: '+2%',
    changeType: 'positive',
    icon: Shield
  }
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Welcome back! Here's what's happening with your documents.</p>
        </div>
        <Link href="/documents/upload" className="btn-primary">
          <Upload className="mr-2 h-4 w-4" />
          Upload Document
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <StatsCard {...stat} />
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Documents */}
        <div className="lg:col-span-2">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Recent Documents</h2>
              <Link href="/documents" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                View all
              </Link>
            </div>
            <div className="space-y-4">
              {recentDocuments.map((doc, index) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <DocumentCard document={doc} />
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <QuickActions />

          {/* Activity Feed */}
          <ActivityFeed />
        </div>
      </div>

      {/* Security Overview */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Security Overview</h2>
          <Link href="/security" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            View details
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="text-center">
            <div className="w-16 h-16 bg-success-100 dark:bg-success-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-success-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Encryption</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">AES-256 encryption</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-primary-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Access Control</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Role-based permissions</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-warning-100 dark:bg-warning-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye className="h-8 w-8 text-warning-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Audit Trail</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Complete activity logs</p>
          </div>
        </div>
      </div>
    </div>
  )
}
