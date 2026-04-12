import React, { Suspense } from 'react'
import Link from 'next/link'
import { ShopFilters } from '@/components/storefront/ShopFilters'
import { ProductGrid } from '@/components/storefront/ProductGrid'
import { getCachedCategoriesWithProductCount, getCachedGlobal, getCachedPriceBounds } from '@/lib/payload-cache'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Where } from 'payload'
import type { Category, Media, SiteSetting } from '@/payload-types'
import type { SerializedProduct } from '@/lib/types'
import { CornerTools } from '@/components/storefront/CornerTools'
import { SortSelect } from '@/components/storefront/SortSelect'
import { resolveSort } from '@/lib/utils'

const PAGE_SIZE = 40


export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>
}) {
  const { categoria } = await searchParams
  const [settings, categories] = await Promise.all([
    getCachedGlobal<SiteSetting>('site-settings')(),
    getCachedCategoriesWithProductCount()(),
  ])
  const activeCategory = categoria ? categories.find((c) => c.slug === categoria) : null
  const title = activeCategory?.name ?? 'Tienda'
  const description =
    activeCategory?.description ||
    settings.siteDescription ||
    `Explorá todos nuestros productos en ${settings.siteName}`
  return {
    title,
    description,
    alternates: { canonical: '/tienda' },
    openGraph: {
      type: 'website',
      title,
      description,
      url: 'https://www.dinatale.com.py/tienda',
      locale: 'es_AR',
    },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default async function TiendaPage({
  searchParams,
}: {
  searchParams: Promise<{
    categoria?: string
    buscar?: string
    precioMin?: string
    precioMax?: string
    ofertas?: string
    ordenar?: string
  }>
}) {
  const { categoria, buscar, precioMin, precioMax, ofertas, ordenar } = await searchParams

  const [settings, categories, priceBounds, payload] = await Promise.all([
    getCachedGlobal<SiteSetting>('site-settings')(),
    getCachedCategoriesWithProductCount()(),
    getCachedPriceBounds()(),
    getPayload({ config: await config }),
  ])

  const currencySymbol = settings.currencySymbol || '$'
  const gridCols = settings.storefront?.gridCols || 5
  const gridColsMobile = settings.storefront?.gridColsMobile || 2
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

  if (ofertas) {
    whereClause.compareAtPrice = { not_equals: null }
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
    sort: resolveSort(ordenar),
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
      sales: product.sales ?? 0,
      views: product.views ?? 0,
      stock: product.stock ?? 5,
      category: product.category as Category[],
    }
  })

  const pageTitle = activeCategorySlug
    ? categories.find((c) => c.slug === activeCategorySlug)?.name ?? 'Tienda'
    : 'Tienda'

  const categoryDescription = categories.find((c) => c.slug === activeCategorySlug)?.description ?? ''

  const filters = {
    categoria: categoria ?? undefined,
    buscar: buscar ?? undefined,
    precioMin: precioMin ?? undefined,
    precioMax: precioMax ?? undefined,
    categoryId: activeCategoryId,
    ordenar: ordenar ?? undefined,
  }

  return (
    <div className="mx-auto max-w-8xl px-4 lg:py-12 py-4 sm:px-6 lg:px-8">
      {settings.showTitles?.showPageTitles !== false && (
        <>
          <h1 className="lg:text-3xl text-2xl font-bold tracking-tight text-wrap-balance sm:text-4xl">
            {ofertas === 'true' ? 'Promos' : pageTitle}
          </h1>
          {categoryDescription && <p className="mt-2 text-muted-foreground">
            {categoryDescription}
          </p>}
          <hr className="my-4" />
        </>
      )}
      

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-64 shrink-0">
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
        </aside>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-end mb-4">
            <Suspense>
              <SortSelect />
            </Suspense>
          </div>
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
              onlyPromo={ofertas === 'true'}
              gridCols={gridCols}
              gridColsMobile={gridColsMobile}
            />
          )}
        </div>
      </div>

      <CornerTools whatsappNumber={settings.whatsappNumber} />
    </div>
  )
}
