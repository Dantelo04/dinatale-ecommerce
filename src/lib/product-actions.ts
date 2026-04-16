'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import type { Where } from 'payload'
import type { Category, Media } from '@/payload-types'
import type { SerializedProduct, ProductFilters } from '@/lib/types'
import { atomicDecrementStock, atomicRollbackStock } from '@/lib/stock-ops'
import { resolveSort } from '@/lib/utils'
import { sendAdminNewOrderEmail } from '@/lib/email'

export type { SerializedProduct }

function buildWhereClause(filters: ProductFilters): Where {
  const where: Where = { active: { equals: true } }

  if (filters.categoryId) {
    where.category = { equals: filters.categoryId }
  }

  if (filters.buscar) {
    where.name = { contains: filters.buscar }
  }

  if (filters.ofertas === 'true') {
    where.compareAtPrice = { not_equals: null }
  }

  const parsedMin = filters.precioMin ? Number(filters.precioMin) : null
  const parsedMax = filters.precioMax ? Number(filters.precioMax) : null

  if (parsedMin !== null && !isNaN(parsedMin)) {
    where.price = { greater_than_equal: parsedMin }
  }

  if (parsedMax !== null && !isNaN(parsedMax)) {
    where.price = {
      ...(typeof where.price === 'object' ? where.price : {}),
      less_than_equal: parsedMax,
    }
  }

  return where
}

export async function loadMoreProducts(
  page: number,
  filters: ProductFilters,
): Promise<{ products: SerializedProduct[]; hasNextPage: boolean }> {
  const payload = await getPayload({ config: await config })
  const where = buildWhereClause(filters)

  const result = await payload.find({
    collection: 'products',
    where,
    limit: filters.limit ?? 40,
    page,
    sort: resolveSort(filters.ordenar),
    depth: 2,
  })

  const products: SerializedProduct[] = result.docs.map((product) => {
    const firstImage = product.images?.[0]?.image as Media | null
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      imageUrl: firstImage?.url ?? null,
      imageAlt: firstImage?.alt ?? product.name,
      sales: product.sales ?? 0,
      views: product.views ?? 0,
      stock: product.stock ?? 5,
      category: product.category as Category[],
    }
  })

  return { products, hasNextPage: result.hasNextPage }
}

export async function incrementProductViews(productId: number): Promise<void> {
  const payload = await getPayload({ config: await config })
  const product = await payload.findByID({ collection: 'products', id: productId, depth: 0 })
  await payload.update({
    collection: 'products',
    id: productId,
    data: { views: (product.views ?? 0) + 1 },
  })
}

export async function incrementProductSales(
  items: { id: number; quantity: number }[],
): Promise<void> {
  const payload = await getPayload({ config: await config })
  await Promise.all(
    items.map(async (item) => {
      const product = await payload.findByID({ collection: 'products', id: item.id, depth: 0 })
      return payload.update({
        collection: 'products',
        id: item.id,
        data: { sales: (product.sales ?? 0) + item.quantity },
      })
    }),
  )
}

export async function processCheckout(
  items: { id: number; name: string; quantity: number; price: number }[],
  customerComment?: string,
  customerName?: string,
  customerPhone?: string,
  deliveryMethod?: 'pickup' | 'delivery',
  deliveryAddress?: string,
): Promise<{ success: true; orderNumber: string } | { success: false; error: string }> {
  if (!items || items.length === 0) {
    return { success: false, error: 'El carrito está vacío.' }
  }
  for (const item of items) {
    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      return { success: false, error: `Cantidad inválida para "${item.name}".` }
    }
  }

  const payload = await getPayload({ config: await config })

  // Re-fetch prices server-side — never trust client-supplied values
  const productDocs = await Promise.all(
    items.map(async (item) => {
      try {
        return await payload.findByID({ collection: 'products', id: item.id, depth: 0 })
      } catch {
        return null
      }
    }),
  )

  const verifiedItems: { id: number; name: string; quantity: number; price: number }[] = []
  for (let i = 0; i < items.length; i++) {
    const doc = productDocs[i]
    const item = items[i]
    if (!doc || !doc.active) {
      return { success: false, error: `Producto no disponible: "${item.name}".` }
    }
    verifiedItems.push({ id: item.id, name: doc.name, quantity: item.quantity, price: doc.price })
  }

  const decremented: { id: number; name: string; quantity: number }[] = []
  for (const item of verifiedItems) {
    const ok = await atomicDecrementStock(payload, item.id, item.quantity)
    if (!ok) {
      await Promise.all(decremented.map((d) => atomicRollbackStock(payload, d.id, d.quantity)))
      return { success: false, error: `No hay suficiente stock de "${item.name}".` }
    }
    decremented.push(item)
  }

  const totalItems = verifiedItems.reduce((sum, item) => sum + item.quantity, 0)
  const totalAmount = verifiedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const orderResult = await payload
    .create({
      collection: 'orders',
      overrideAccess: true,
      draft: false,
      data: {
        status: 'received',
        paymentMethod: 'whatsapp' as const,
        ...(customerName ? { customerName } : {}),
        ...(customerPhone ? { customerPhone } : {}),
        items: verifiedItems.map((item) => ({
          product: item.id,
          productName: item.name,
          quantity: item.quantity,
          unitPrice: item.price,
        })),
        totalItems,
        totalAmount,
        ...(customerComment ? { customerComment } : {}),
        ...(deliveryMethod ? { deliveryMethod } : {}),
        ...(deliveryAddress ? { deliveryAddress } : {}),
      },
    })
    .catch(async (err) => {
      await Promise.all(decremented.map((d) => atomicRollbackStock(payload, d.id, d.quantity)))
      console.error('[processCheckout] order creation failed, stock rolled back:', err)
      return null
    })

  if (!orderResult) {
    return { success: false, error: 'Error al crear el pedido. Por favor intentá nuevamente.' }
  }
  const order = orderResult

  // Notify admin of new WhatsApp order
  const settings = await payload.findGlobal({
    slug: 'site-settings',
    depth: 0,
    overrideAccess: true,
  })
  const adminEmail = settings.adminNotificationEmail
  if (adminEmail) {
    await sendAdminNewOrderEmail(payload, adminEmail, {
      id: order.id,
      orderNumber: order.orderNumber as string,
      status: order.status as 'received',
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      items: (order.items ?? []).map((item) => ({
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
      totalAmount: order.totalAmount,
      deliveryMethod: order.deliveryMethod as 'pickup' | 'delivery' | null | undefined,
      deliveryAddress: order.deliveryAddress,
    })
  }

  return { success: true, orderNumber: order.orderNumber! }
}
