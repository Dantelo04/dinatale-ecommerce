import React from 'react'
import { notFound } from 'next/navigation'
import { getCachedOrderByNumber, getCachedGlobal } from '@/lib/payload-cache'
import { OrderStatusView } from '@/components/storefront/OrderStatusView'
import type { SiteSetting } from '@/payload-types'
import type { OrderStatus } from '@/lib/types'

export const metadata = {
  title: 'Estado del Pedido',
  robots: { index: false, follow: false },
}

export default async function OrderStatusPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>
}) {
  const { orderNumber } = await params

  const [{ docs }, settings] = await Promise.all([
    getCachedOrderByNumber(decodeURIComponent(orderNumber))(),
    getCachedGlobal<SiteSetting>('site-settings')(),
  ])

  const order = docs[0]
  if (!order) notFound()

  return (
    <OrderStatusView
      order={{
        orderNumber: order.orderNumber ?? '',
        status: order.status as OrderStatus,
        customerName: order.customerName ?? null,
        items: (order.items ?? []).map((item) => ({
          productName: item.productName ?? '',
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
        totalItems: order.totalItems,
        totalAmount: order.totalAmount,
        customerComment: order.customerComment ?? null,
        deliveryMethod: order.deliveryMethod ?? null,
        deliveryAddress: order.deliveryAddress ?? null,
        createdAt: order.createdAt,
      }}
      currencySymbol={settings.currencySymbol || '$'}
    />
  )
}
