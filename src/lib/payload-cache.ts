import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Where } from 'payload'
import { Product } from '@/payload-types'

const isDev = process.env.NODE_ENV === 'development'

async function getPayloadInstance() {
  return getPayload({ config: await config })
}

function cache<T>(fn: () => Promise<T>, keys: string[], tags: string[]): () => Promise<T> {
  if (isDev) return fn
  return unstable_cache(fn, keys, { tags })
}

export const getCachedGlobal = <T>(slug: 'site-settings' | 'storefront-content', depth = 1) =>
  cache<T>(
    async () => {
      const payload = await getPayloadInstance()
      return payload.findGlobal({ slug, depth }) as Promise<T>
    },
    [slug, `depth-${depth}`],
    [slug],
  )

export const getCachedProducts = (options?: {
  where?: Where
  limit?: number
  sort?: string
  depth?: number
}) =>
  cache(
    async () => {
      const payload = await getPayloadInstance()
      return payload.find({
        collection: 'products',
        where: options?.where ?? { active: { equals: true } },
        limit: options?.limit ?? 50,
        sort: options?.sort ?? '-createdAt',
        depth: options?.depth ?? 2,
      })
    },
    ['products', JSON.stringify(options ?? {})],
    ['products'],
  )

export const getCachedProductBySlug = (slug: string) =>
  cache(
    async () => {
      const payload = await getPayloadInstance()
      return payload.find({
        collection: 'products',
        where: { slug: { equals: slug }, active: { equals: true } },
        limit: 1,
        depth: 2,
      })
    },
    ['products', `product-${slug}`],
    ['products'],
  )

export const getCachedCategories = (limit = 50) =>
  cache(
    async () => {
      const payload = await getPayloadInstance()
      return payload.find({
        collection: 'categories',
        limit,
        depth: 1,
      })
    },
    ['categories'],
    ['categories'],
  )

export const getCachedPriceBounds = () =>
  cache(
    async () => {
      const payload = await getPayloadInstance()

      const [cheapest, mostExpensive] = await Promise.all([
        payload.find({
          collection: 'products',
          where: { active: { equals: true } },
          sort: 'price',
          limit: 1,
          depth: 0,
          select: { price: true },
        }),
        payload.find({
          collection: 'products',
          where: { active: { equals: true } },
          sort: '-price',
          limit: 1,
          depth: 0,
          select: { price: true },
        }),
      ])

      const min = cheapest.docs[0]?.price ?? 0
      const max = mostExpensive.docs[0]?.price ?? 0

      return { min: Math.floor(min), max: Math.ceil(max) }
    },
    ['products-price-bounds'],
    ['products'],
  )
