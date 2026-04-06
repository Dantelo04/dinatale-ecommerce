'use client'

import { Category, Media } from '@/payload-types'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight } from 'lucide-react'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from '@/components/ui/carousel'

interface CategoriesGalleryProps {
  storefrontCategories: {
    category: Category
    id?: string | null
  }[]
  title?: string
  variant?: 'variant1' | 'variant2'
}

export const CategoriesGallery = ({
  storefrontCategories,
  title,
  variant,
}: CategoriesGalleryProps) => {
  if (storefrontCategories.length === 0) return null

  if (variant === 'variant1') {
    return (
      <section className="lg:pt-16 pt-8">
        <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-8 ">
          <h2 className="text-xl font-bold tracking-tight text-wrap-balance sm:text-2xl">
            {title ?? 'Comprar por Categoría'}
          </h2>
          <hr className="my-2" />
        </div>

        <div className="relative mt-6 mx-auto max-w-8xl px-0 sm:px-6 lg:px-8">
          <Carousel opts={{ align: 'start' }} className="w-full">
            <CarouselContent className="sm:px-0 px-1 sm:pb-0 pb-3" hasCards={true}>
              {storefrontCategories.map((cat, idx) => {
                const catImage = cat.category.image as Media | null

                return (
                  <CarouselItem
                    key={cat.category.id}
                    className="pl-3 basis-[45%] sm:basis-1/3 lg:basis-1/5"
                  >
                    <Link href={`/tienda?categoria=${cat.category.slug}`}>
                      <div className="transition-all overflow-hidden rounded-lg shadow-md">
                        <div className="bg-muted flex flex-col group">
                          {catImage?.url ? (
                            <Image
                              src={catImage.url}
                              alt={cat.category.name}
                              // fill
                              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                              width={1000}
                              height={1000}
                              className="object-cover aspect-square w-full group-hover:scale-105 transition-all duration-300 group-active:scale-105"
                              priority={idx < 3}
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                              {cat.category.name}
                            </div>
                          )}
                          <div className="backdrop-blur-sm bg-white/80 px-3 sm:py-4 py-3 flex items-center justify-between gap-2 w-full">
                            <span className="text-sm font-medium line-clamp-1 text-foreground">
                              {cat.category.name}
                            </span>
                            <ChevronRight className="h-4 w-4 shrink-0 text-foreground" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </CarouselItem>
                )
              })}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex" />
            <CarouselNext className="hidden sm:flex" />
          </Carousel>
        </div>
      </section>
    )
  } else {
    return (
      <section className="lg:pt-16 pt-8">
        <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-8 ">
          <h2 className="text-xl font-bold tracking-tight text-wrap-balance sm:text-2xl">
            {title ?? 'Comprar por Categoría'}
          </h2>
          <hr className="my-2" />
        </div>

        <div className="relative mt-6 mx-auto max-w-8xl px-0 sm:px-6 lg:px-8">
          <Carousel opts={{ align: 'start' }} className="w-full">
            <CarouselContent className="sm:px-0 px-1 sm:pb-0 pb-3" hasCards={true}>
              {storefrontCategories.map((cat, idx) => {
                const catImage = cat.category.image as Media | null

                return (
                  <CarouselItem
                    key={cat.category.id}
                    className="pl-3 basis-[45%] sm:basis-1/3 lg:basis-1/5"
                  >
                    <Link href={`/tienda?categoria=${cat.category.slug}`}>
                      <div className="group relative transition-all active:scale-95 overflow-hidden rounded-lg shadow-md">
                        <div className="relative aspect-square bg-muted">
                          {catImage?.url ? (
                            <Image
                              src={catImage.url}
                              alt={cat.category.name}
                              fill
                              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                              priority={idx < 3}
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                              {cat.category.name}
                            </div>
                          )}
                          <div className="absolute bottom-0 left-0 right-0 backdrop-blur-sm bg-white/80 px-3 sm:py-4 py-3 flex items-center justify-between gap-2 w-full">
                            <span className="text-sm font-medium line-clamp-1 text-foreground">
                              {cat.category.name}
                            </span>
                            <ChevronRight className="h-4 w-4 shrink-0 text-foreground" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </CarouselItem>
                )
              })}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex" />
            <CarouselNext className="hidden sm:flex" />
          </Carousel>
        </div>
      </section>
    )
  }
}
