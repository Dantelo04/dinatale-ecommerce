'use server'

import { headers } from 'next/headers'
import { revalidateTag } from 'next/cache'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { OrderStatus, SerializedOrder } from './types'
import { ORDER_STATUSES } from './types'

async function getAdminPayload() {
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers: await headers() })
  if (!user?.roles?.includes('admin')) {
    throw new Error('No autorizado')
  }
  return payload
}

function serializeOrder(o: {
  id: number
  orderNumber?: string | null
  status: 'received' | 'in_process' | 'shipped' | 'delivered' | 'finalized'
  customerName?: string | null
  customerPhone?: string | null
  items: { productName: string; quantity: number; unitPrice: number; id?: string | null }[]
  totalItems: number
  totalAmount: number
  customerComment?: string | null
  createdAt: string
}): SerializedOrder {
  return {
    id: o.id,
    orderNumber: o.orderNumber ?? '',
    status: o.status,
    customerName: o.customerName ?? null,
    customerPhone: o.customerPhone ?? null,
    items: o.items.map((i) => ({
      productName: i.productName,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
    })),
    totalItems: o.totalItems,
    totalAmount: o.totalAmount,
    customerComment: o.customerComment ?? null,
    createdAt: o.createdAt,
  }
}

export async function fetchAllOrders(): Promise<SerializedOrder[]> {
  const payload = await getAdminPayload()
  const result = await payload.find({
    collection: 'orders',
    limit: 500,
    sort: '-createdAt',
    depth: 0,
    overrideAccess: true,
  })
  return result.docs.map((o) =>
    serializeOrder({
      ...o,
      items: (o.items ?? []).map((i) => ({
        productName: i.productName,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        id: i.id,
      })),
    }),
  )
}

export async function finalizeDeliveredOrders(): Promise<{ count: number }> {
  const payload = await getAdminPayload()
  const result = await payload.find({
    collection: 'orders',
    where: { status: { equals: 'delivered' } },
    limit: 500,
    depth: 0,
    overrideAccess: true,
  })
  await Promise.all(
    result.docs.map((o) =>
      payload.update({
        collection: 'orders',
        id: o.id,
        data: { status: 'finalized' },
        overrideAccess: true,
      }),
    ),
  )
  revalidateTag('orders')
  return { count: result.docs.length }
}

export async function updateOrderStatus(orderId: number, status: OrderStatus): Promise<void> {
  if (!ORDER_STATUSES.includes(status)) {
    throw new Error('Estado inválido')
  }
  const payload = await getAdminPayload()
  await payload.update({
    collection: 'orders',
    id: orderId,
    data: { status },
    overrideAccess: true,
  })
  revalidateTag('orders')
}
