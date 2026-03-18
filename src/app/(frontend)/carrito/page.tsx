import React from 'react'
import { CartPageClient } from '@/components/storefront/CartPageClient'
import { getCachedGlobal } from '@/lib/payload-cache'
import type { SiteSetting } from '@/payload-types'

export const metadata = {
  title: 'Carrito',
  robots: { index: false, follow: false },
}

export default async function CarritoPage() {
  const settings = await getCachedGlobal<SiteSetting>('site-settings')()

  return (
    <CartPageClient
      whatsappNumber={settings.whatsappNumber}
      currencySymbol={settings.currencySymbol || '$'}
      siteName={settings.siteName}
    />
  )
}
