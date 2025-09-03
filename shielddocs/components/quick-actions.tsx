'use client'

import { Upload, Share2, Users, Settings } from 'lucide-react'
import Link from 'next/link'

export function QuickActions() {
  const actions = [
    {
      name: 'Upload Document',
      description: 'Add new files to your library',
      icon: Upload,
      href: '/documents/upload',
      color: 'bg-primary-100 dark:bg-primary-900 text-primary-600'
    },
    {
      name: 'Share Document',
      description: 'Collaborate with team members',
      icon: Share2,
      href: '/documents/share',
      color: 'bg-success-100 dark:bg-success-900 text-success-600'
    },
    {
      name: 'Manage Team',
      description: 'Control access and permissions',
      icon: Users,
      href: '/team',
      color: 'bg-warning-100 dark:bg-warning-900 text-warning-600'
    },
    {
      name: 'Security Settings',
      description: 'Configure security preferences',
      icon: Settings,
      href: '/security',
      color: 'bg-danger-100 dark:bg-danger-900 text-danger-600'
    }
  ]

  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Actions</h2>
      <div className="space-y-3">
        {actions.map((action) => (
          <Link
            key={action.name}
            href={action.href}
            className="flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${action.color}`}>
              <action.icon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100">{action.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{action.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
