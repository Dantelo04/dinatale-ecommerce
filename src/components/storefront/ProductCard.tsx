'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShoppingCart } from 'lucide-react'
import { useCart } from './CartProvider'
import { formatPrice } from '@/lib/utils'

interface ProductCardProps {
  id: number
  name: string
  slug: string
  price: number
  compareAtPrice?: number | null
  imageUrl: string | null
  imageAlt: string
  currencySymbol: string
}

export function ProductCard({
  id,
  name,
  slug,
  price,
  compareAtPrice,
  imageUrl,
  imageAlt,
  currencySymbol,
}: ProductCardProps) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  const hasDiscount = compareAtPrice && compareAtPrice > price

  const handleAdd = () => {
    addItem({ id, name, price, imageUrl, slug })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <Card className="group overflow-hidden border border-border transition-shadow hover:shadow-lg pt-0 gap-0">
      <Link
        href={`/tienda/${slug}`}
        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-t-lg"
      >
        <div className="relative aspect-square overflow-hidden bg-muted">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={imageAlt}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              Sin imagen
            </div>
          )}
        </div>
      </Link>
      <CardContent className="flex flex-col gap-2 p-4 pb-0 h-full">
        {hasDiscount && (
          <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-semibold text-white w-fit">
            Oferta
          </span>
        )}
        <Link
          href={`/tienda/${slug}`}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
        >
          <h3 className="line-clamp-2 text-sm font-medium leading-snug text-foreground min-w-0">
            {name}
          </h3>
        </Link>
        <div className="flex items-center -mt-1 flex-wrap">
          {hasDiscount && (
            <span className="text-lg text-muted-foreground line-through tabular-nums">
              {formatPrice(compareAtPrice, currencySymbol)}
            </span>
          )}
          <span className="text-lg font-bold tabular-nums">
            {formatPrice(price, currencySymbol)}
          </span>
        </div>
        <div className="h-full flex items-end">
          <Button
            size="sm"
            className="mt-1 w-full bg-site-primary text-primary-foreground hover:opacity-90 transition-opacity active:bg-primary/60"
            onClick={handleAdd}
            aria-label={`Agregar ${name} al carrito`}
          >
            <ShoppingCart className="mr-2 h-4 w-4" aria-hidden="true" />
            {added ? 'Agregado!' : 'Agregar'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
