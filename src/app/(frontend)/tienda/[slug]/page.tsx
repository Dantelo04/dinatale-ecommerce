import React from 'react'
import { notFound } from 'next/navigation'
import type { Media, Category, SiteSetting, Product } from '@/payload-types'
import { ProductDetail } from '@/components/storefront/ProductDetail'
import { ProductViewTracker } from '@/components/storefront/ProductViewTracker'
import { getCachedGlobal, getCachedProductBySlug, getCachedProducts } from '@/lib/payload-cache'
import { ProductsGallery } from '@/components/storefront/ProductsGallery'

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

  // Extract first category ID for the recommended products query
  const cats = product.category as (number | Category)[] | null
  const firstCatId =
    Array.isArray(cats) && cats.length > 0
      ? typeof cats[0] === 'object'
        ? cats[0].id
        : cats[0]
      : null

  const [{ docs: recommended }, { docs: promoProducts }] = await Promise.all([
    firstCatId
      ? getCachedProducts({
          where: {
            category: { equals: firstCatId },
            id: { not_in: [product.id] },
            active: { equals: true },
          },
          sort: '-sales',
          limit: 5,
          depth: 2,
        })()
      : Promise.resolve({ docs: [] as import('@/payload-types').Product[] }),
    getCachedProducts({
      where: {
        compareAtPrice: { greater_than: 0 },
        id: { not_in: [product.id] },
        active: { equals: true },
      },
      sort: '-sales',
      limit: 5,
      depth: 2,
    })(),
  ])

  const variantProducts = ((product.variants ?? []) as (number | Product)[])
    .filter((v): v is Product => typeof v === 'object')
    .map((v) => ({
      id: v.id,
      name: v.name,
      slug: v.slug,
      price: v.price,
      compareAtPrice: v.compareAtPrice ?? null,
      imageUrl: ((v.images?.[0]?.image) as Media | null)?.url ?? null,
    }))

  const currencySymbol = settings.currencySymbol || '$'

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
          stock: product.stock ?? 5,
          category: product.category as Category[],
        }}
        currencySymbol={currencySymbol}
        variants={variantProducts}
        variantLabel={product.variantLabel ?? null}
      />
      {recommended.length > 0 && (
        <ProductsGallery
          products={recommended}
          currencySymbol={currencySymbol}
          title="Productos relacionados"
          columnQuantity={5}
        />
      )}
      {product.showPromos && promoProducts.length > 0 && (
        <ProductsGallery
          products={promoProducts}
          currencySymbol={currencySymbol}
          title="Productos en promo"
          columnQuantity={5}
        />
      )}
    </>
  )
}
