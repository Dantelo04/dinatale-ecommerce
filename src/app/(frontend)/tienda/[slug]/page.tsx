import React from 'react'
import { notFound } from 'next/navigation'
import type { Media, Category, SiteSetting } from '@/payload-types'
import { ProductDetail } from '@/components/storefront/ProductDetail'
import { getCachedGlobal, getCachedProductBySlug, updateCachedProduct } from '@/lib/payload-cache'


export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { docs } = await getCachedProductBySlug(slug)()

  if (!docs[0]) return { title: 'Producto no encontrado' }
  return { title: docs[0].name }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const [settings, { docs }] = await Promise.all([
    getCachedGlobal<SiteSetting>('site-settings')(),
    getCachedProductBySlug(slug)(),
  ])

  const product = docs[0]
  if (!product) notFound()

  const images = (product.images ?? [])
    .map((img) => img.image as Media)
    .filter((img): img is Media => typeof img === 'object' && img !== null)

  const category = product.category as Category | null

  if (product) await updateCachedProduct(product.id, { views: product.views ?? 0 + 1 })

  return (
    <ProductDetail
      product={{
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        description: product.description,
        images,
        categoryName: category?.name ?? null,
      }}
      currencySymbol={settings.currencySymbol || '$'}
    />
  )
}
