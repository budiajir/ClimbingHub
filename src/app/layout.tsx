import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ThemeProvider } from '@/lib/theme-context'
import { AuthProvider } from '@/lib/auth-context'
import AppLayoutShell from '@/components/shell/AppLayoutShell'
import AuthModal from '@/components/auth/AuthModal'

export const metadata: Metadata = {
  title: 'Jalur — Bouldering & Climbing Community',
  description: 'The premier bouldering and rock climbing platform. Interactive topo database, gym passes, beta logs, and climber community.',
}

export const viewport: Viewport = {
  themeColor: '#23262C',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-lime selection:text-granite">
        <ThemeProvider>
          <AuthProvider>
            <AppLayoutShell>
              {children}
            </AppLayoutShell>

            {/* Global Auth Modal for Login/Register gate */}
            <AuthModal />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
