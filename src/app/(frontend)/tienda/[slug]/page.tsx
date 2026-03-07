import React from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound } from 'next/navigation'
import type { Media, Category } from '@/payload-types'
import { ProductDetail } from '@/components/storefront/ProductDetail'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const payload = await getPayload({ config: await config })
  const { docs } = await payload.find({
    collection: 'products',
    where: { slug: { equals: slug }, active: { equals: true } },
    limit: 1,
    depth: 0,
  })

  if (!docs[0]) return { title: 'Producto no encontrado' }

  return { title: docs[0].name }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const payload = await getPayload({ config: await config })

  const settings = await payload.findGlobal({ slug: 'site-settings' })
  const { docs } = await payload.find({
    collection: 'products',
    where: { slug: { equals: slug }, active: { equals: true } },
    limit: 1,
    depth: 2,
  })

  const product = docs[0]
  if (!product) notFound()

  const images = (product.images ?? [])
    .map((img) => img.image as Media)
    .filter((img): img is Media => typeof img === 'object' && img !== null)

  const category = product.category as Category | null

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
