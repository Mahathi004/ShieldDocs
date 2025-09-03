'use client'

import { motion } from 'framer-motion'
import { Shield, Lock, Users, BarChart3, ArrowRight, Check, Star } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

const features = [
  {
    icon: Shield,
    title: 'Bank-Grade Security',
    description: 'AES-256 encryption, end-to-end protection, and secure access controls'
  },
  {
    icon: Users,
    title: 'Smart Collaboration',
    description: 'Real-time editing, version control, and seamless team coordination'
  },
  {
    icon: BarChart3,
    title: 'AI-Powered Insights',
    description: 'Document analysis, keyword extraction, and intelligent recommendations'
  },
  {
    icon: Lock,
    title: 'Compliance Ready',
    description: 'GDPR, HIPAA, and SOC 2 compliant with comprehensive audit trails'
  }
]

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'CTO at TechCorp',
    content: 'ShieldDocs has transformed how we handle sensitive documents. The security features are outstanding.',
    rating: 5
  },
  {
    name: 'Michael Chen',
    role: 'Legal Director',
    content: 'The collaboration features are incredible. Our legal team can work seamlessly across documents.',
    rating: 5
  },
  {
    name: 'Emily Rodriguez',
    role: 'Operations Manager',
    content: 'AI insights help us identify important information quickly. Game changer for our workflow.',
    rating: 5
  }
]

export default function LandingPage() {
  const [activeFeature, setActiveFeature] = useState(0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Navigation */}
      <nav className="relative z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-primary-600" />
            <span className="text-2xl font-bold text-gradient">ShieldDocs</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100">Features</a>
            <a href="#pricing" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100">Pricing</a>
            <a href="#about" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100">About</a>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/auth/signin" className="btn-secondary">Sign In</Link>
            <Link href="/auth/signup" className="btn-primary">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              Secure, Smart &{' '}
              <span className="text-gradient">Collaborative</span>
              <br />
              Document Management
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
              ShieldDocs helps you store, share, and collaborate on sensitive documents with bank-grade security and AI-powered insights.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link href="/auth/signup" className="btn-primary text-lg px-8 py-4">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <button className="btn-secondary text-lg px-8 py-4">
                Watch Demo
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-6 py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Everything you need for secure document management
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Built for teams that need enterprise-grade security without compromising on collaboration
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`flex items-start space-x-4 p-4 rounded-lg transition-colors ${
                    activeFeature === index ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                  }`}
                  onMouseEnter={() => setActiveFeature(index)}
                >
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <feature.icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="neumorphic p-8 rounded-2xl"
              >
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                  <div className="flex items-center space-x-2 mb-4">
                    <Shield className="h-5 w-5 text-primary-600" />
                    <span className="font-medium text-gray-900 dark:text-gray-100">Security Dashboard</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Encryption Status</span>
                      <span className="text-sm font-medium text-success-600">Active</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Access Control</span>
                      <span className="text-sm font-medium text-success-600">Enabled</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Audit Trail</span>
                      <span className="text-sm font-medium text-success-600">Complete</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-6 py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Trusted by leading companies
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              See what our customers have to say about ShieldDocs
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card p-6"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-warning-500 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  "{testimonial.content}"
                </p>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{testimonial.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 bg-primary-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to secure your documents?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of teams already using ShieldDocs for secure document management
          </p>
          <Link href="/auth/signup" className="bg-white text-primary-600 hover:bg-gray-100 font-medium py-3 px-8 rounded-lg transition-colors inline-flex items-center">
            Get Started Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-primary-600" />
              <span className="text-xl font-bold text-white">ShieldDocs</span>
            </div>
            <p className="text-sm">
              © 2024 ShieldDocs. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
