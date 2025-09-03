'use client'

import { useState } from 'react'
import { User, Settings, LogOut, ChevronDown } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import Image from 'next/image'

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const { data: session } = useSession()

  if (!session) {
    return (
      <div className="flex items-center space-x-4">
        <button className="btn-secondary">Sign In</button>
        <button className="btn-primary">Sign Up</button>
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        {session.user?.image ? (
          <Image
            src={session.user.image}
            alt={session.user.name || 'User'}
            width={32}
            height={32}
            className="rounded-full"
          />
        ) : (
          <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
        )}
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {session.user?.name || 'User'}
        </span>
        <ChevronDown className="h-4 w-4 text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
          <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {session.user?.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {session.user?.email}
            </p>
          </div>
          <button
            onClick={() => {
              // Handle settings
              setIsOpen(false)
            }}
            className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Settings className="mr-3 h-4 w-4" />
            Settings
          </button>
          <button
            onClick={() => {
              signOut()
              setIsOpen(false)
            }}
            className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <LogOut className="mr-3 h-4 w-4" />
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
