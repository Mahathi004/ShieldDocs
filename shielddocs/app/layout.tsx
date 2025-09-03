import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ShieldDocs - Secure Document Management',
  description: 'Secure, Smart & Collaborative Document Management with bank-grade security and AI-powered insights.',
  keywords: ['document management', 'security', 'collaboration', 'AI', 'encryption'],
  authors: [{ name: 'ShieldDocs Team' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    title: 'ShieldDocs - Secure Document Management',
    description: 'Secure, Smart & Collaborative Document Management with bank-grade security and AI-powered insights.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ShieldDocs - Secure Document Management',
    description: 'Secure, Smart & Collaborative Document Management with bank-grade security and AI-powered insights.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
