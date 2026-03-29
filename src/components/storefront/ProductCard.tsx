'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShoppingCart } from 'lucide-react'
import { useCart } from './CartProvider'
import { formatPrice } from '@/lib/utils'
import type { SerializedProduct } from '@/lib/types'

type ProductCardProps = SerializedProduct & { currencySymbol: string }

export function ProductCard({
  id,
  name,
  slug,
  price,
  compareAtPrice,
  imageUrl,
  imageAlt,
  currencySymbol,
  sales,
  views,
  stock,
  category,
}: ProductCardProps) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  const hasDiscount = compareAtPrice && compareAtPrice > price
  const outOfStock = stock === 0

  const handleAdd = () => {
    if (outOfStock) return
    addItem({ id, name, price, imageUrl, slug, sales, views, stock, category })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="relative h-full transition-all">
      {hasDiscount && (
        <span className="absolute top-2 left-2 z-10 rounded-full bg-site-primary px-2 py-0.5 text-sm font-semibold text-white w-fit">
          -{Math.round(((compareAtPrice - price) / compareAtPrice) * 100)}%
        </span>
      )}
      <Card className="group overflow-hidden pt-0 gap-0 shadow-none pb-0 transition-all h-full border-none rounded-none">
        <Link
          href={`/tienda/${slug}`}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring "
        >
          <div className="relative aspect-square overflow-hidden rounded-lg">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={imageAlt}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
                style={{ filter: outOfStock ? 'grayscale(50%)' : 'none' }}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                Sin imagen
              </div>
            )}
          </div>
        </Link>
        <CardContent className="flex flex-col pb-0 h-full pt-3 px-0">
          {category && category.length > 0 && (
            <span className="">
              <Link
                key={category[0].id}
                href={`/tienda?categoria=${category[0].slug}`}
                className="text-xs text-muted-foreground tracking-wider font-medium hover:underline"
              >
                {category[0].name}
              </Link>
            </span>
          )}
          <Link
            href={`/tienda/${slug}`}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          >
            <h3 className="line-clamp-2 font-bold text-sm text-foreground min-w-0 hover:underline">{name}</h3>
            <div className="flex items-center mt-1.5 flex-wrap gap-1">
              {hasDiscount && (
                <span className="text-sm text-muted-foreground line-through tabular-nums">
                  {formatPrice(compareAtPrice, currencySymbol)}
                </span>
              )}
              <span className="tabular-nums text-sm">{formatPrice(price, currencySymbol)}</span>
            </div>
          </Link>
          <div className="flex flex-col h-full gap-2 justify-end">
            <Button
              size="sm"
              className="mt-3.5 w-full bg-site-primary text-primary-foreground hover:opacity-90 transition-opacity active:bg-primary/60 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleAdd}
              disabled={outOfStock}
              aria-label={outOfStock ? `${name} sin stock` : `Agregar ${name} al carrito`}
            >
              <ShoppingCart className="mr-2 h-4 w-4" aria-hidden="true" />
              {outOfStock ? 'Sin stock' : added ? 'Agregado!' : 'Agregar'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
