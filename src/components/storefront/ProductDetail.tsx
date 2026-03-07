'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useCart } from './CartProvider'
import { formatPrice } from '@/lib/utils'
import type { Media } from '@/payload-types'
import { RichTextContent } from './RichTextContent'

interface ProductDetailProps {
  product: {
    id: number
    name: string
    slug: string
    price: number
    compareAtPrice?: number | null
    description?: Record<string, unknown> | null
    images: Media[]
    categoryName: string | null
  }
  currencySymbol: string
}

export function ProductDetail({ product, currencySymbol }: ProductDetailProps) {
  const { addItem } = useCart()
  const [selectedImage, setSelectedImage] = useState(0)
  const [added, setAdded] = useState(false)

  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price
  const currentImage = product.images[selectedImage]

  const handleAdd = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.images[0]?.url ?? null,
      slug: product.slug,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/tienda"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        Volver a la tienda
      </Link>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
            {currentImage?.url ? (
              <Image
                src={currentImage.url}
                alt={currentImage.alt || product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                Sin imagen
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    idx === selectedImage ? 'border-site-primary' : 'border-transparent'
                  }`}
                  aria-label={`Ver imagen ${idx + 1} de ${product.name}`}
                >
                  {img.url && (
                    <Image
                      src={img.url}
                      alt={img.alt || `${product.name} - imagen ${idx + 1}`}
                      fill
                      sizes="80px"
                      className="object-cover"
                      loading="lazy"
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col">
          {product.categoryName && (
            <Badge variant="secondary" className="mb-3 w-fit">
              {product.categoryName}
            </Badge>
          )}

          <h1 className="text-3xl font-bold tracking-tight text-wrap-balance">{product.name}</h1>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-bold tabular-nums">
              {formatPrice(product.price, currencySymbol)}
            </span>
            {hasDiscount && (
              <span className="text-lg text-muted-foreground line-through tabular-nums">
                {formatPrice(product.compareAtPrice!, currencySymbol)}
              </span>
            )}
          </div>

          <Separator className="my-6" />

          {product.description && (
            <div className="prose prose-neutral max-w-none text-foreground">
              <RichTextContent content={product.description} />
            </div>
          )}

          <div className="mt-8">
            <Button
              size="lg"
              className="w-full bg-site-primary text-primary-foreground hover:opacity-90 transition-opacity sm:w-auto"
              onClick={handleAdd}
              aria-label={`Agregar ${product.name} al carrito`}
            >
              <ShoppingCart className="mr-2 h-5 w-5" aria-hidden="true" />
              {added ? 'Agregado!' : 'Agregar al Carrito'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
