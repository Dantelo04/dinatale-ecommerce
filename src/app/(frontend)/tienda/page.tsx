import React from 'react'
import Link from 'next/link'
import { ProductCard } from '@/components/storefront/ProductCard'
import { CategoryFilter } from '@/components/storefront/CategoryFilter'
import { getCachedGlobal, getCachedProducts, getCachedCategories } from '@/lib/payload-cache'
import type { Where } from 'payload'
import type { Media, Category, Product, SiteSetting } from '@/payload-types'

export const metadata = { title: 'Tienda' }

export default async function TiendaPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>
}) {
  const { categoria } = await searchParams

  const [settings, { docs: categories }] = await Promise.all([
    getCachedGlobal<SiteSetting>('site-settings')(),
    getCachedCategories()(),
  ])

  const currencySymbol = settings.currencySymbol || '$'

  const whereClause: Where = { active: { equals: true } }
  let activeCategory: Category | null = null

  if (categoria) {
    const matchedCat = categories.find((c) => c.slug === categoria)
    if (matchedCat) {
      activeCategory = matchedCat
      whereClause.category = { equals: matchedCat.id }
    }
  }

  const { docs: products } = await getCachedProducts({
    where: whereClause,
    limit: 50,
    sort: '-createdAt',
  })()

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-wrap-balance sm:text-4xl">
        {activeCategory ? activeCategory.name : 'Tienda'}
      </h1>

      {categories.length > 0 && (
        <CategoryFilter
          categories={categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug }))}
          activeCategoryId={activeCategory?.id ?? null}
        />
      )}

      {products.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="text-lg text-muted-foreground">No se encontraron productos.</p>
          {activeCategory && (
            <Link href="/tienda" className="mt-4 inline-block text-sm font-medium text-site-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm">
              Ver todos los productos
            </Link>
          )}
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product: Product) => {
            const firstImage = product.images?.[0]?.image as Media | null
            return (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                slug={product.slug}
                price={product.price}
                compareAtPrice={product.compareAtPrice}
                imageUrl={firstImage?.url ?? null}
                imageAlt={firstImage?.alt ?? product.name}
                currencySymbol={currencySymbol}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
