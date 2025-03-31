import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import type { Metadata } from 'next'
import { DisableDevTools } from '@/components/DisableDevTools'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ChatSync - Connect and collaborate seamlessly',
  description: 'A modern, minimalist messaging application for seamless communication and collaboration.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <DisableDevTools />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
} 