import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getCachedOrders, getCachedGlobal } from '@/lib/payload-cache'
import { OrdersKanban } from '@/components/storefront/OrdersKanban'
import type { SiteSetting } from '@/payload-types'
import type { SerializedOrder } from '@/lib/types'

export const metadata = {
  title: 'Gestión de Pedidos',
  robots: { index: false, follow: false },
}

export default async function OrdersPage() {
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers: await headers() })

  if (!user?.roles?.includes('admin')) {
    redirect('/tienda')
  }

  const [ordersResult, settings] = await Promise.all([
    getCachedOrders()(),
    getCachedGlobal<SiteSetting>('site-settings')(),
  ])

  const orders: SerializedOrder[] = ordersResult.docs.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber ?? '',
    status: o.status,
    customerName: o.customerName ?? null,
    customerPhone: o.customerPhone ?? null,
    items: (o.items ?? []).map((i) => ({
      productName: i.productName,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
    })),
    totalItems: o.totalItems,
    totalAmount: o.totalAmount,
    customerComment: o.customerComment ?? null,
    createdAt: o.createdAt,
  }))

  return (
    <OrdersKanban
      initialOrders={orders}
      currencySymbol={settings.currencySymbol || '$'}
    />
  )
}
