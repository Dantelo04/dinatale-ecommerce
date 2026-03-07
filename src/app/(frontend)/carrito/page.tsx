import React from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import { CartPageClient } from '@/components/storefront/CartPageClient'

export const metadata = { title: 'Carrito' }

export default async function CarritoPage() {
  const payload = await getPayload({ config: await config })
  const settings = await payload.findGlobal({ slug: 'site-settings' })

  return (
    <CartPageClient
      whatsappNumber={settings.whatsappNumber}
      currencySymbol={settings.currencySymbol || '$'}
      siteName={settings.siteName}
    />
  )
}
