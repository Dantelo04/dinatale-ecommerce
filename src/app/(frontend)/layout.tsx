import React from 'react'
import './styles.css'
import { DM_Sans, Epilogue } from 'next/font/google'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { Header } from '@/components/storefront/Header'
import { Footer } from '@/components/storefront/Footer'
import { CartProvider } from '@/components/storefront/CartProvider'
import { AdminBar } from '@/components/storefront/AdminBar'
import { getCachedGlobal } from '@/lib/payload-cache'
import type { Media } from '@/payload-types'
import type { SiteSetting, StorefrontContent } from '@/payload-types'
import { GoogleAnalytics, GoogleTagManager } from '@next/third-parties/google'

const dmSans = DM_Sans({ subsets: ['latin'], display: 'swap' })
const epilogue = Epilogue({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-heading',
})

const SITE_URL = 'https://www.dinatale.com.py'

export async function generateMetadata() {
  const settings = await getCachedGlobal<SiteSetting>('site-settings')()

  const faviconUrl = (settings.favicon as Media)?.url ?? null
  const icons = faviconUrl
    ? [{ rel: 'icon' as const, url: faviconUrl }]
    : undefined

  const description = settings.siteDescription || `Tienda online - ${settings.siteName}`

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: settings.siteName,
      template: `%s | ${settings.siteName}`,
    },
    description,
    themeColor: settings.primaryColor || '#18181b',
    icons,
    openGraph: {
      type: 'website',
      siteName: settings.siteName,
      title: settings.siteName,
      description,
      url: SITE_URL,
      locale: 'es_AR',
    },
    twitter: {
      card: 'summary_large_image',
      title: settings.siteName,
      description,
    },
    alternates: {
      canonical: '/',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [settings, content, payload] = await Promise.all([
    getCachedGlobal<SiteSetting>('site-settings')(),
    getCachedGlobal<StorefrontContent>('storefront-content')(),
    getPayload({ config: await config }),
  ])

  const { user } = await payload.auth({ headers: await headers() })
  const isAdmin = Boolean(user?.roles?.includes('admin'))

  const primaryColor = settings.primaryColor || '#18181b'
  const secondaryColor = settings.secondaryColor || '#71717a'
  const logoUrl = (settings.logo as Media)?.url ?? null
  const headerLogoSide = settings.headerLogoSide as 'left' | 'center' | 'right'

  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: settings.siteName,
    url: 'https://www.dinatale.com.py',
    ...(logoUrl ? { logo: logoUrl } : {}),
  }

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
      <GoogleAnalytics gaId="G-N3BBXYFZHF" />
      <GoogleTagManager gtmId="GTM-W7WNVJM6" />
      <body className={`${dmSans.className} ${epilogue.variable} min-h-screen flex flex-col`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        {isAdmin && <AdminBar userEmail={user!.email} />}
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
            headerLogoSide={headerLogoSide}
            logoSize={settings.logoSize || '10'}
            logoSizeMobile={settings.logoSizeMobile || '9'}
            alertText={settings.customAlert?.alertTitle || ''}
            primaryColor={primaryColor}
            isAdmin={isAdmin}
          />
          <main id="main-content" className="flex-1 pb-16">{children}</main>
          <Footer
            siteName={settings.siteName}
            logoUrl={logoUrl}
            hideName={settings.hideName ?? false}
            socialLinks={content.socialLinks}
            siteDescription={settings.siteDescription}
          />
        </CartProvider>
      </body>
    </html>
  )
}
