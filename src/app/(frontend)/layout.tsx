import React from 'react'
import './styles.css'
import { Header } from '@/components/storefront/Header'
import { Footer } from '@/components/storefront/Footer'
import { CartProvider } from '@/components/storefront/CartProvider'
import { getCachedGlobal } from '@/lib/payload-cache'
import type { Media } from '@/payload-types'
import type { SiteSetting, StorefrontContent } from '@/payload-types'

export async function generateMetadata() {
  const settings = await getCachedGlobal<SiteSetting>('site-settings')()

  const faviconUrl = (settings.favicon as Media)?.url ?? null
  const icons = faviconUrl
    ? [{ rel: 'icon' as const, url: faviconUrl }]
    : undefined

  return {
    title: {
      default: settings.siteName,
      template: `%s | ${settings.siteName}`,
    },
    description: `Tienda online - ${settings.siteName}`,
    themeColor: settings.primaryColor || '#18181b',
    icons,
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [settings, content] = await Promise.all([
    getCachedGlobal<SiteSetting>('site-settings')(),
    getCachedGlobal<StorefrontContent>('storefront-content')(),
  ])

  const primaryColor = settings.primaryColor || '#18181b'
  const secondaryColor = settings.secondaryColor || '#71717a'
  const logoUrl = (settings.logo as Media)?.url ?? null

  return (
    <html
      lang="es"
      style={
        {
          '--site-primary': primaryColor,
          '--site-secondary': secondaryColor,
        } as React.CSSProperties
      }
    >
      <body className="min-h-screen flex flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-foreground focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring"
        >
          Saltar al contenido principal
        </a>
        <CartProvider currencySymbol={settings.currencySymbol || '$'}>
          <Header
            siteName={settings.siteName}
            logoUrl={logoUrl}
            hideName={settings.hideName ?? false}
            currencySymbol={settings.currencySymbol || '$'}
          />
          <main id="main-content" className="flex-1 pb-16">{children}</main>
          <Footer
            siteName={settings.siteName}
            logoUrl={logoUrl}
            hideName={settings.hideName ?? false}
            socialLinks={content.socialLinks}
          />
        </CartProvider>
      </body>
    </html>
  )
}
