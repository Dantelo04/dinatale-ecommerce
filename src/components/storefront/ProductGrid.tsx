'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Loader2 } from 'lucide-react'
import { ProductCard } from './ProductCard'
import { loadMoreProducts, type SerializedProduct } from '@/lib/product-actions'

interface ProductGridProps {
  initialProducts: SerializedProduct[]
  hasNextPage: boolean
  currencySymbol: string
  filters: {
    categoria?: string
    buscar?: string
    precioMin?: string
    precioMax?: string
    categoryId?: number | null
  }
}

export function ProductGrid({
  initialProducts,
  hasNextPage: initialHasNextPage,
  currencySymbol,
  filters,
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
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {products.map((product) => (
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
