'use client'

import { useState, useEffect } from 'react'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/providers/AuthProvider'
import { NotificationProvider } from '@/components/notifications/NotificationProvider'

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <NotificationProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  )
} 