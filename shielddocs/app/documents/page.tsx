'use client'

import { motion } from 'framer-motion'
import { Upload, Search, Filter, Grid, List, MoreVertical, Download, Share2, Trash2, Eye } from 'lucide-react'
import { useState } from 'react'
import { DocumentCard } from '@/components/document-card'
import { DocumentUpload } from '@/components/document-upload'

const documents = [
  {
    id: 1,
    name: 'Q4 Financial Report.pdf',
    type: 'PDF',
    size: '2.4 MB',
    uploadedAt: '2 hours ago',
    views: 12,
    downloads: 3,
    isShared: true,
    status: 'active',
    tags: ['financial', 'quarterly', 'report']
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
    status: 'active',
    tags: ['marketing', 'strategy']
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
    status: 'active',
    tags: ['contract', 'template', 'legal']
  },
  {
    id: 4,
    name: 'Product Roadmap.pptx',
    type: 'PPTX',
    size: '4.2 MB',
    uploadedAt: '1 week ago',
    views: 15,
    downloads: 2,
    isShared: true,
    status: 'active',
    tags: ['product', 'roadmap', 'presentation']
  },
  {
    id: 5,
    name: 'Employee Handbook.pdf',
    type: 'PDF',
    size: '5.6 MB',
    uploadedAt: '2 weeks ago',
    views: 42,
    downloads: 12,
    isShared: true,
    status: 'active',
    tags: ['employee', 'handbook', 'hr']
  }
]

export default function DocumentsPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [showUpload, setShowUpload] = useState(false)

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesFilter = selectedFilter === 'all' || doc.type.toLowerCase() === selectedFilter
    return matchesSearch && matchesFilter
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Documents</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage and organize your secure documents</p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="btn-primary"
        >
          <Upload className="mr-2 h-4 w-4" />
          Upload Document
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-64 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>
          
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="all">All Types</option>
            <option value="pdf">PDF</option>
            <option value="docx">DOCX</option>
            <option value="pptx">PPTX</option>
            <option value="xlsx">XLSX</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'grid'
                ? 'bg-primary-100 dark:bg-primary-900 text-primary-600'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            <Grid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'list'
                ? 'bg-primary-100 dark:bg-primary-900 text-primary-600'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Documents Grid/List */}
      {filteredDocuments.length > 0 ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {filteredDocuments.map((doc, index) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <DocumentCard document={doc} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No documents found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchQuery ? 'Try adjusting your search terms.' : 'Upload your first document to get started.'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setShowUpload(true)}
              className="btn-primary"
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Document
            </button>
          )}
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <DocumentUpload onClose={() => setShowUpload(false)} />
      )}
    </div>
  )
}
