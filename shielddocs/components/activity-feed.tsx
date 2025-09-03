'use client'

import { Clock, User, FileText, Share2 } from 'lucide-react'

const activities = [
  {
    id: 1,
    type: 'upload',
    user: 'John Doe',
    document: 'Q4 Financial Report.pdf',
    time: '2 hours ago',
    icon: FileText,
    color: 'text-primary-600'
  },
  {
    id: 2,
    type: 'share',
    user: 'Sarah Wilson',
    document: 'Marketing Strategy.docx',
    time: '4 hours ago',
    icon: Share2,
    color: 'text-success-600'
  },
  {
    id: 3,
    type: 'access',
    user: 'Mike Johnson',
    document: 'Contract Template.pdf',
    time: '1 day ago',
    icon: User,
    color: 'text-warning-600'
  },
  {
    id: 4,
    type: 'upload',
    user: 'Emily Davis',
    document: 'Product Roadmap.pptx',
    time: '2 days ago',
    icon: FileText,
    color: 'text-primary-600'
  }
]

export function ActivityFeed() {
  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Recent Activity</h2>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3">
            <div className={`w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center ${activity.color}`}>
              <activity.icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 dark:text-gray-100">
                <span className="font-medium">{activity.user}</span>
                {activity.type === 'upload' && ' uploaded '}
                {activity.type === 'share' && ' shared '}
                {activity.type === 'access' && ' accessed '}
                <span className="font-medium">{activity.document}</span>
              </p>
              <div className="flex items-center mt-1">
                <Clock className="h-3 w-3 text-gray-400 mr-1" />
                <span className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
          View all activity
        </button>
      </div>
    </div>
  )
}
