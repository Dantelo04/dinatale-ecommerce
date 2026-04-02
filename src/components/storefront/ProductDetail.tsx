'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { formatPrice } from '@/lib/utils'
import type { Category, Media } from '@/payload-types'
import { RichTextContent } from './RichTextContent'
import { AddToCartButton } from './AddToCartButton'

interface VariantProduct {
  id: number
  name: string
  slug: string
  price: number
  compareAtPrice?: number | null
  imageUrl: string | null
}

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
    sales: number
    views: number
    stock: number
    category: Category[]
  }
  currencySymbol: string
  variants?: VariantProduct[]
  variantLabel?: string | null
}

export function ProductDetail({ product, currencySymbol, variants, variantLabel }: ProductDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null)
  const router = useRouter()

  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price
  const outOfStock = product.stock === 0
  const currentImage = product.images[selectedImage]

  return (
    <div className="mx-auto max-w-8xl px-4 py-8 sm:px-6 lg:pt-8 pt-6 lg:px-8">
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

        <div className="flex flex-col lg:mt-0 -mt-4">
          {product.categoryName && (
            <Badge variant="secondary" className="mb-3 w-fit">
              {product.categoryName}
            </Badge>
          )}

          <h1 className="text-3xl font-bold tracking-tight text-wrap-balance">{product.name}</h1>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl tabular-nums">
              {formatPrice(product.price, currencySymbol)}
            </span>
            {hasDiscount && (
              <span className="text-lg text-muted-foreground line-through tabular-nums">
                {formatPrice(product.compareAtPrice!, currencySymbol)}
              </span>
            )}
          </div>

          {variants && variants.length > 0 && (
            <div className="mt-6">
              <p className="text-sm mb-3">
                {variantLabel && <span className="font-medium">{variantLabel}: </span>}
                <span className="font-bold">{product.name}</span>
              </p>
              <div className="flex gap-2 flex-wrap">
                <div className="border-2 border-[var(--color-site-primary)] rounded-lg p-1 w-[4.5rem] shrink-0">
                  <div className="relative aspect-square overflow-hidden rounded-md bg-muted">
                    {product.images[0]?.url && (
                      <Image
                        src={product.images[0].url}
                        alt={product.images[0].alt || product.name}
                        fill
                        sizes="72px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  {/* <div className="text-xs font-semibold tabular-nums leading-tight">
                    {formatPrice(product.price, currencySymbol)}
                  </div>
                  {hasDiscount && (
                    <div className="text-xs text-muted-foreground line-through tabular-nums leading-tight">
                      {formatPrice(product.compareAtPrice!, currencySymbol)}
                    </div>
                  )} */}
                </div>
                {variants.map((v) => {
                  const isLoading = navigatingTo === v.slug
                  const isDisabled = navigatingTo !== null
                  return (
                    <button
                      key={v.id}
                      onClick={() => {
                        if (isDisabled) return
                        setNavigatingTo(v.slug)
                        router.push(`/tienda/${v.slug}`)
                      }}
                      disabled={isDisabled}
                      aria-label={`Ver variante: ${v.name}`}
                      className={`border-2 rounded-lg p-1 w-[4.5rem] flex-shrink-0 transition-all relative ${
                        isLoading
                          ? 'border-(--color-site-primary)/50 opacity-70 cursor'
                          : isDisabled
                            ? 'border-transparent opacity-40'
                            : 'border-transparent hover:border-(--color-site-primary)/50 cursor-pointer'
                      }`}
                    >
                      <div className="relative aspect-square overflow-hidden rounded-md bg-muted">
                        {v.imageUrl && (
                          <Image
                            src={v.imageUrl}
                            alt={v.name}
                            fill
                            sizes="72px"
                            className={`object-cover transition-opacity ${isLoading ? 'opacity-50' : ''}`}
                          />
                        )}
                        {isLoading && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="h-4 w-4 rounded-full border-2 border-site-primary border-t-transparent animate-spin" />
                          </div>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <Separator className="my-6" />

          {product.description && (
            <div className="prose prose-neutral max-w-none text-foreground">
              <RichTextContent content={product.description} />
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3">
            <AddToCartButton
              product={{
                id: product.id,
                name: product.name,
                price: product.price,
                imageUrl: product.images[0]?.url ?? null,
                slug: product.slug,
                sales: product.sales ?? 0,
                views: product.views ?? 0,
                stock: product.stock,
                category: product.category,
              }}
              size="lg"
              className="w-full sm:w-auto"
              outOfStock={outOfStock}
            />
            {outOfStock && (
              <p className="text-sm text-muted-foreground">
                Este producto no está disponible en este momento.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
