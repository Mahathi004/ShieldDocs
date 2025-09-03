'use client'

import { FileText, Eye, Download, Share2, Clock } from 'lucide-react'
import { motion } from 'framer-motion'

interface Document {
  id: number
  name: string
  type: string
  size: string
  uploadedAt: string
  views: number
  downloads: number
  isShared: boolean
  status: string
}

interface DocumentCardProps {
  document: Document
}

export function DocumentCard({ document }: DocumentCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="card p-4 hover:shadow-lg transition-shadow cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
            <FileText className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100">
              {document.name}
            </h3>
            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <span>{document.type}</span>
              <span>•</span>
              <span>{document.size}</span>
              <span>•</span>
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{document.uploadedAt}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
            <Eye className="h-4 w-4" />
            <span>{document.views}</span>
          </div>
          <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
            <Download className="h-4 w-4" />
            <span>{document.downloads}</span>
          </div>
          {document.isShared && (
            <div className="flex items-center space-x-1 text-sm text-primary-600">
              <Share2 className="h-4 w-4" />
              <span>Shared</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
