import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ThemeProvider } from '@/lib/theme-context'
import { AuthProvider } from '@/lib/auth-context'
import AppLayoutShell from '@/components/shell/AppLayoutShell'
import AuthModal from '@/components/auth/AuthModal'
import RoleSwitcher from '@/components/auth/RoleSwitcher'

export const metadata: Metadata = {
  title: 'ClimbHub Indonesia — Bouldering & Climbing Community',
  description: 'Platform climbing dan bouldering untuk komunitas panjat tebing Indonesia. Topo database, gym booking, beta videos & community meetups.',
}

export const viewport: Viewport = {
  themeColor: '#12161A',
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
    <html lang="id">
      <body className="antialiased selection:bg-lime selection:text-granite">
        <ThemeProvider>
          <AuthProvider>
            <AppLayoutShell>
              {children}
            </AppLayoutShell>

            {/* Global Auth Modal for Login/Register gate */}
            <AuthModal />

            {/* Interactive Role Switcher for Demo / Testing */}
            <RoleSwitcher />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
