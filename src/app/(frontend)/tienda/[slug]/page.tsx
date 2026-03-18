import React from 'react'
import { notFound } from 'next/navigation'
import type { Media, Category, SiteSetting } from '@/payload-types'
import { ProductDetail } from '@/components/storefront/ProductDetail'
import { ProductViewTracker } from '@/components/storefront/ProductViewTracker'
import { getCachedGlobal, getCachedProductBySlug } from '@/lib/payload-cache'

const SITE_URL = 'https://www.dinatale.com.py'

// Extract plain text from Lexical rich text JSON (first paragraph, max 155 chars)
function lexicalToText(content: unknown, max = 155): string {
  if (!content || typeof content !== 'object') return ''
  const root = (content as { root?: { children?: unknown[] } }).root
  if (!root?.children) return ''
  for (const node of root.children) {
    if ((node as { type?: string }).type === 'paragraph') {
      const children = (node as { children?: unknown[] }).children ?? []
      const text = children
        .filter((c): c is { text: string } => typeof (c as { text?: unknown }).text === 'string')
        .map((c) => c.text)
        .join('')
        .trim()
      if (text) return text.length > max ? text.slice(0, max - 1) + '…' : text
    }
  }
  return ''
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [{ docs }, settings] = await Promise.all([
    getCachedProductBySlug(slug)(),
    getCachedGlobal<SiteSetting>('site-settings')(),
  ])

  if (!docs[0]) return { title: 'Producto no encontrado' }

  const product = docs[0]
  const firstImage = (product.images?.[0]?.image as Media | null)?.url ?? null
  const description =
    lexicalToText(product.description) || `Comprá ${product.name} en ${settings.siteName}`

  return {
    title: product.name,
    description,
    alternates: { canonical: `/tienda/${slug}` },
    openGraph: {
      type: 'website',
      title: product.name,
      description,
      url: `${SITE_URL}/tienda/${slug}`,
      locale: 'es_AR',
      ...(firstImage ? { images: [{ url: firstImage, alt: product.name }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description,
      ...(firstImage ? { images: [firstImage] } : {}),
    },
  }
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
  const firstImageUrl = images[0]?.url ?? null
  const description =
    lexicalToText(product.description) || `Comprá ${product.name} en ${settings.siteName}`

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description,
    url: `${SITE_URL}/tienda/${product.slug}`,
    ...(firstImageUrl ? { image: firstImageUrl } : {}),
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'PYG',
      availability: 'https://schema.org/InStock',
      url: `${SITE_URL}/tienda/${product.slug}`,
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <ProductViewTracker productId={product.id} />
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
          sales: product.sales ?? 0,
          views: product.views ?? 0,
        }}
        currencySymbol={settings.currencySymbol || '$'}
      />
    </>
  )
}
