'use client'

import { useTheme } from 'next-themes'
import { Sun, Moon, Monitor } from 'lucide-react'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
    )
  }

  return (
    <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
      <button
        onClick={() => setTheme('light')}
        className={`p-2 rounded-md transition-colors ${
          theme === 'light'
            ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
        }`}
      >
        <Sun className="h-4 w-4" />
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`p-2 rounded-md transition-colors ${
          theme === 'dark'
            ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
        }`}
      >
        <Moon className="h-4 w-4" />
      </button>
      <button
        onClick={() => setTheme('system')}
        className={`p-2 rounded-md transition-colors ${
          theme === 'system'
            ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
        }`}
      >
        <Monitor className="h-4 w-4" />
      </button>
    </div>
  )
}
