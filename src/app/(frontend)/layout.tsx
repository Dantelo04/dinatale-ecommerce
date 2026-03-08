import React from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import './styles.css'
import { Header } from '@/components/storefront/Header'
import { Footer } from '@/components/storefront/Footer'
import { CartProvider } from '@/components/storefront/CartProvider'
import type { Media } from '@/payload-types'

export async function generateMetadata() {
  const payload = await getPayload({ config: await config })
  const settings = await payload.findGlobal({ slug: 'site-settings' })

  return {
    title: {
      default: settings.siteName,
      template: `%s | ${settings.siteName}`,
    },
    description: `Tienda online - ${settings.siteName}`,
    themeColor: settings.primaryColor || '#18181b',
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const payload = await getPayload({ config: await config })
  const settings = await payload.findGlobal({ slug: 'site-settings', depth: 1 })
  const content = await payload.findGlobal({ slug: 'storefront-content', depth: 1 })

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
            currencySymbol={settings.currencySymbol || '$'}
          />
          <main id="main-content" className="flex-1">{children}</main>
          <Footer
            siteName={settings.siteName}
            logoUrl={logoUrl}
            socialLinks={content.socialLinks}
          />
        </CartProvider>
      </body>
    </html>
  )
}
