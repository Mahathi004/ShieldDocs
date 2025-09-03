'use client'

import { motion } from 'framer-motion'
import { Shield, Lock, Users, BarChart3, Upload, Search, Bell, Settings, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from '@/components/theme-toggle'
import { UserMenu } from '@/components/user-menu'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { name: 'Documents', href: '/documents', icon: Upload },
  { name: 'Collaboration', href: '/collaboration', icon: Users },
  { name: 'Security', href: '/security', icon: Lock },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white dark:bg-gray-800">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gradient">ShieldDocs</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`sidebar-item ${isActive ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <div className="flex h-16 items-center px-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gradient">ShieldDocs</span>
            </div>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`sidebar-item ${isActive ? 'active' : ''}`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top navigation */}
        <div className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              className="lg:hidden -m-2.5 p-2.5 text-gray-700 dark:text-gray-300"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search documents..."
                  className="pl-10 pr-4 py-2 w-64 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                <Bell className="h-6 w-6" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-danger-500"></span>
              </button>
              <UserMenu />
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {children}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  )
}
