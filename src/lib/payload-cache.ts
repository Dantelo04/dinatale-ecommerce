import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Where } from 'payload'

async function getPayloadInstance() {
  return getPayload({ config: await config })
}

export const getCachedGlobal = <T>(slug: 'site-settings' | 'storefront-content', depth = 1) =>
  unstable_cache(
    async (): Promise<T> => {
      const payload = await getPayloadInstance()
      return payload.findGlobal({ slug, depth }) as Promise<T>
    },
    [slug],
    { tags: [slug] },
  )

export const getCachedProducts = (options?: {
  where?: Where
  limit?: number
  sort?: string
  depth?: number
}) =>
  unstable_cache(
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
    { tags: ['products'] },
  )

export const getCachedProductBySlug = (slug: string) =>
  unstable_cache(
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
    { tags: ['products'] },
  )

export const getCachedCategories = (limit = 50) =>
  unstable_cache(
    async () => {
      const payload = await getPayloadInstance()
      return payload.find({
        collection: 'categories',
        limit,
        depth: 1,
      })
    },
    ['categories'],
    { tags: ['categories'] },
  )
