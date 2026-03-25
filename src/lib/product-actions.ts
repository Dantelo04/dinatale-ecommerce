'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import type { Where } from 'payload'
import type { Media } from '@/payload-types'
import type { SerializedProduct, ProductFilters } from '@/lib/types'

export type { SerializedProduct }

const PAGE_SIZE = 24

function buildWhereClause(filters: ProductFilters): Where {
  const where: Where = { active: { equals: true } }

  if (filters.categoryId) {
    where.category = { equals: filters.categoryId }
  }

  if (filters.buscar) {
    where.name = { contains: filters.buscar }
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
    limit: PAGE_SIZE,
    page,
    sort: '-createdAt',
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
): Promise<{ success: true } | { success: false; error: string }> {
  const payload = await getPayload({ config: await config })

  for (const item of items) {
    const product = await payload.findByID({ collection: 'products', id: item.id, depth: 0 })
    if ((product.stock ?? 0) < item.quantity) {
      return {
        success: false,
        error: `Solo quedan ${product.stock} unidades de "${item.name}".`,
      }
    }
  }

  await Promise.all(
    items.map(async (item) => {
      const product = await payload.findByID({ collection: 'products', id: item.id, depth: 0 })
      return payload.update({
        collection: 'products',
        id: item.id,
        data: {
          sales: (product.sales ?? 0) + item.quantity,
          stock: Math.max(0, (product.stock ?? 0) - item.quantity),
        },
      })
    }),
  )

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  await payload.create({
    collection: 'orders',
    overrideAccess: true,
    draft: false,
    data: {
      items: items.map((item) => ({
        product: item.id,
        productName: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
      })),
      totalItems,
      totalAmount,
      ...(customerComment ? { customerComment } : {}),
    },
  })

  return { success: true }
}
