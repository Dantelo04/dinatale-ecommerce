'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Loader2 } from 'lucide-react'
import { ProductCard } from './ProductCard'
import { loadMoreProducts } from '@/lib/product-actions'
import type { SerializedProduct, ProductFilters } from '@/lib/types'
import { Category } from '@/payload-types'

interface ProductGridProps {
  initialProducts: SerializedProduct[]
  hasNextPage: boolean
  currencySymbol: string
  onlyPromo?: boolean
  filters: ProductFilters
  gridCols?: number
  gridColsMobile?: number
}

const gridColsMap: Record<number, string> = {
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
  5: 'lg:grid-cols-5',
  6: 'lg:grid-cols-6',
  7: 'lg:grid-cols-7',
  8: 'lg:grid-cols-8',
  9: 'lg:grid-cols-9',
  10: 'lg:grid-cols-10',
}

const gridColsMobileMap: Record<number, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
  7: 'grid-cols-7',
  8: 'grid-cols-8',
  9: 'grid-cols-9',
  10: 'grid-cols-10',
}

export function ProductGrid({
  initialProducts,
  hasNextPage: initialHasNextPage,
  currencySymbol,
  filters,
  onlyPromo = false,
  gridCols = 5,
  gridColsMobile = 2,
}: ProductGridProps) {
  const [products, setProducts] = useState(initialProducts)
  const [hasNextPage, setHasNextPage] = useState(initialHasNextPage)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(2)
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setProducts(initialProducts)
    setHasNextPage(initialHasNextPage)
    setPage(2)
  }, [initialProducts, initialHasNextPage])

  const fetchMore = useCallback(async () => {
    if (loading || !hasNextPage) return
    setLoading(true)

    try {
      const result = await loadMoreProducts(page, filters)
      setProducts((prev) => [...prev, ...result.products])
      setHasNextPage(result.hasNextPage)
      setPage((p) => p + 1)
    } finally {
      setLoading(false)
    }
  }, [loading, hasNextPage, page, filters])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !hasNextPage) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchMore()
        }
      },
      { rootMargin: '300px' },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasNextPage, fetchMore])

  if (products.length === 0) return null

  return (
    <>
      <div className={`grid ${gridColsMobileMap[gridColsMobile ?? 2]} gap-6 lg:gap-3 sm:grid-cols-2 lg:grid-cols-4 ${gridColsMap[gridCols ?? 5]}`}>
        {(onlyPromo ? products.filter((product) => product.compareAtPrice) : products).map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            slug={product.slug}
            price={product.price}
            compareAtPrice={product.compareAtPrice}
            imageUrl={product.imageUrl}
            imageAlt={product.imageAlt}
            currencySymbol={currencySymbol}
            sales={product.sales}
            views={product.views}
            stock={product.stock}
            category={product.category as Category[]}
          />
        ))}
      </div>

      {hasNextPage && (
        <div ref={sentinelRef} className="flex items-center justify-center py-8" aria-live="polite">
          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              <span>Cargando mas productos...</span>
            </div>
          )}
        </div>
      )}
    </>
  )
}
