'use client'

import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, Users, FileText, Download, Eye, Share2, Calendar } from 'lucide-react'
import { useState } from 'react'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const chartData = [
  { name: 'Jan', documents: 45, views: 120, downloads: 30 },
  { name: 'Feb', documents: 52, views: 145, downloads: 35 },
  { name: 'Mar', documents: 48, views: 138, downloads: 32 },
  { name: 'Apr', documents: 61, views: 165, downloads: 42 },
  { name: 'May', documents: 55, views: 152, downloads: 38 },
  { name: 'Jun', documents: 67, views: 178, downloads: 45 },
]

const documentTypes = [
  { name: 'PDF', value: 45, color: '#3B82F6' },
  { name: 'DOCX', value: 25, color: '#10B981' },
  { name: 'PPTX', value: 15, color: '#F59E0B' },
  { name: 'XLSX', value: 10, color: '#EF4444' },
  { name: 'Images', value: 5, color: '#8B5CF6' },
]

const topDocuments = [
  { name: 'Q4 Financial Report.pdf', views: 156, downloads: 23, type: 'PDF' },
  { name: 'Marketing Strategy.docx', views: 134, downloads: 18, type: 'DOCX' },
  { name: 'Contract Template.pdf', views: 98, downloads: 15, type: 'PDF' },
  { name: 'Product Roadmap.pptx', views: 87, downloads: 12, type: 'PPTX' },
  { name: 'Employee Handbook.pdf', views: 76, downloads: 8, type: 'PDF' },
]

const insights = [
  {
    title: 'Document Growth',
    value: '+23%',
    description: 'Documents uploaded this month',
    icon: TrendingUp,
    color: 'text-success-600',
    bgColor: 'bg-success-100 dark:bg-success-900'
  },
  {
    title: 'Active Users',
    value: '89',
    description: 'Users accessing documents',
    icon: Users,
    color: 'text-primary-600',
    bgColor: 'bg-primary-100 dark:bg-primary-900'
  },
  {
    title: 'Storage Used',
    value: '2.4 GB',
    description: 'Of 10 GB total storage',
    icon: FileText,
    color: 'text-warning-600',
    bgColor: 'bg-warning-100 dark:bg-warning-900'
  },
  {
    title: 'Security Score',
    value: '98%',
    description: 'Overall security rating',
    icon: BarChart3,
    color: 'text-danger-600',
    bgColor: 'bg-danger-100 dark:bg-danger-900'
  }
]

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('6m')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400">Track your document usage and insights</p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="3m">Last 3 months</option>
            <option value="6m">Last 6 months</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {insights.map((insight, index) => (
          <motion.div
            key={insight.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{insight.title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{insight.value}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{insight.description}</p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${insight.bgColor}`}>
                <insight.icon className={`h-6 w-6 ${insight.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Chart */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Document Activity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: 'none', 
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }} 
              />
              <Legend />
              <Line type="monotone" dataKey="documents" stroke="#3B82F6" strokeWidth={2} />
              <Line type="monotone" dataKey="views" stroke="#10B981" strokeWidth={2} />
              <Line type="monotone" dataKey="downloads" stroke="#F59E0B" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Document Types */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Document Types</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={documentTypes}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {documentTypes.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: 'none', 
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Documents */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Top Documents</h3>
          <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            View all
          </button>
        </div>
        <div className="space-y-4">
          {topDocuments.map((doc, index) => (
            <motion.div
              key={doc.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                  <FileText className="h-4 w-4 text-primary-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{doc.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{doc.type}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <Eye className="h-4 w-4" />
                  <span>{doc.views}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Download className="h-4 w-4" />
                  <span>{doc.downloads}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Recent Uploads</h3>
          <div className="space-y-3">
            {topDocuments.slice(0, 3).map((doc, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-success-100 dark:bg-success-900 rounded-lg flex items-center justify-center">
                  <FileText className="h-4 w-4 text-success-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-gray-100">{doc.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Uploaded 2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Recent Shares</h3>
          <div className="space-y-3">
            {topDocuments.slice(0, 3).map((doc, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-warning-100 dark:bg-warning-900 rounded-lg flex items-center justify-center">
                  <Share2 className="h-4 w-4 text-warning-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-gray-100">{doc.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Shared with 3 people</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
