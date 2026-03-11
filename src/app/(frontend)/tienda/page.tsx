import React, { Suspense } from 'react'
import Link from 'next/link'
import { ShopFilters } from '@/components/storefront/ShopFilters'
import { ProductGrid } from '@/components/storefront/ProductGrid'
import { getCachedGlobal, getCachedCategories, getCachedPriceBounds } from '@/lib/payload-cache'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Where } from 'payload'
import type { Media, SiteSetting } from '@/payload-types'
import type { SerializedProduct } from '@/lib/product-actions'
import { CornerTools } from '@/components/storefront/CornerTools'

const PAGE_SIZE = 24

export const metadata = { title: 'Tienda' }

export default async function TiendaPage({
  searchParams,
}: {
  searchParams: Promise<{
    categoria?: string
    buscar?: string
    precioMin?: string
    precioMax?: string
  }>
}) {
  const { categoria, buscar, precioMin, precioMax } = await searchParams

  const [settings, { docs: categories }, priceBounds, payload] = await Promise.all([
    getCachedGlobal<SiteSetting>('site-settings')(),
    getCachedCategories()(),
    getCachedPriceBounds()(),
    getPayload({ config: await config }),
  ])

  const currencySymbol = settings.currencySymbol || '$'

  const whereClause: Where = { active: { equals: true } }
  let activeCategorySlug: string | null = null
  let activeCategoryId: number | null = null

  if (categoria) {
    const matchedCat = categories.find((c) => c.slug === categoria)
    if (matchedCat) {
      activeCategorySlug = matchedCat.slug
      activeCategoryId = matchedCat.id
      whereClause.category = { equals: matchedCat.id }
    }
  }

  if (buscar) {
    whereClause.name = { contains: buscar }
  }

  const parsedMin = precioMin ? Number(precioMin) : null
  const parsedMax = precioMax ? Number(precioMax) : null

  if (parsedMin !== null && !isNaN(parsedMin)) {
    whereClause.price = {
      ...(typeof whereClause.price === 'object' ? whereClause.price : {}),
      greater_than_equal: parsedMin,
    }
  }

  if (parsedMax !== null && !isNaN(parsedMax)) {
    whereClause.price = {
      ...(typeof whereClause.price === 'object' ? whereClause.price : {}),
      less_than_equal: parsedMax,
    }
  }

  const result = await payload.find({
    collection: 'products',
    where: whereClause,
    limit: PAGE_SIZE,
    page: 1,
    sort: '-createdAt',
    depth: 2,
  })

  const initialProducts: SerializedProduct[] = result.docs.map((product) => {
    const firstImage = product.images?.[0]?.image as Media | null
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      imageUrl: firstImage?.url ?? null,
      imageAlt: firstImage?.alt ?? product.name,
    }
  })

  const pageTitle = activeCategorySlug
    ? categories.find((c) => c.slug === activeCategorySlug)?.name ?? 'Tienda'
    : 'Tienda'

  const filters = {
    categoria: categoria ?? undefined,
    buscar: buscar ?? undefined,
    precioMin: precioMin ?? undefined,
    precioMax: precioMax ?? undefined,
    categoryId: activeCategoryId,
  }

  return (
    <div className="mx-auto max-w-7xl px-4 lg:py-12 py-6 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-wrap-balance sm:text-4xl">
        {pageTitle}
      </h1>

      <Suspense>
        <ShopFilters
          categories={categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug }))}
          activeCategorySlug={activeCategorySlug}
          priceRange={priceBounds}
          initialSearch={buscar ?? ''}
          initialPriceMin={parsedMin}
          initialPriceMax={parsedMax}
          currencySymbol={currencySymbol}
        />
      </Suspense>

      {initialProducts.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="text-lg text-muted-foreground">No se encontraron productos.</p>
          {(activeCategorySlug || buscar || parsedMin !== null || parsedMax !== null) && (
            <Link href="/tienda" className="mt-4 inline-block text-sm font-medium text-site-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm">
              Limpiar filtros y ver todos
            </Link>
          )}
        </div>
      ) : (
        <ProductGrid
          initialProducts={initialProducts}
          hasNextPage={result.hasNextPage}
          currencySymbol={currencySymbol}
          filters={filters}
        />
      )}

      <CornerTools whatsappNumber={settings.whatsappNumber} />
    </div>
  )
}
